import "../Config/loadEnv";
import "reflect-metadata";
import nodemailer, { Transporter } from "nodemailer";

class EmailUtil {
    private transporter: Transporter | null = null;

    private getCredentials() {
        const user = (
            process.env.EMAIL_USER ||
            process.env.SMTP_USER ||
            process.env.MAIL_USER ||
            ""
        ).trim();
        const pass = (
            process.env.EMAIL_PASS ||
            process.env.SMTP_PASS ||
            process.env.MAIL_PASS ||
            ""
        ).replace(/\s+/g, "");
        const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
        const port = Number(process.env.SMTP_PORT || 587);
        const from = (process.env.EMAIL_FROM || user).trim();

        return { user, pass, host, port, from };
    }

    private getTransporter(): Transporter {
        if (this.transporter) {
            return this.transporter;
        }

        // Re-read credentials every time we build a transporter so we always
        // get the latest values (important when env loads asynchronously).
        const { user, pass, host, port } = this.getCredentials();

        if (!user || !pass) {
            throw new Error(
                `Email is not configured. EMAIL_USER=${user || "(missing)"}, EMAIL_PASS=${pass ? "(set)" : "(missing)"}. Set these in .env as Gmail App Password.`
            );
        }

        const isGmail = host.includes("gmail.com") || user.endsWith("@gmail.com");

        console.log(`[EmailUtil] Creating transporter — user: ${user}, isGmail: ${isGmail}`);

        this.transporter = nodemailer.createTransport(
            isGmail
                ? {
                    service: "gmail",
                    auth: { user, pass },
                }
                : {
                    host,
                    port,
                    secure: port === 465,
                    auth: { user, pass },
                }
        );

        return this.transporter;
    }

    /** Call this on server start to catch misconfiguration early. */
    public async verifyConnection(): Promise<void> {
        try {
            const transporter = this.getTransporter();
            await transporter.verify();
            console.log("[EmailUtil] SMTP connection verified successfully.");
        } catch (error: any) {
            console.error("[EmailUtil] SMTP connection FAILED:", error.message);
            // Reset so next attempt rebuilds the transporter with fresh credentials.
            this.transporter = null;
            throw error;
        }
    }

    public async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
        const { user, from } = this.getCredentials();
        const transporter = this.getTransporter();

        try {
            await transporter.sendMail({
                from: from || user,
                to,
                subject,
                text,
                html,
            });
            console.log(`Email sent successfully to: ${to}`);
        } catch (error: any) {
            // Reset cached transporter so next call rebuilds it (handles expired auth).
            this.transporter = null;
            console.error(`[EmailUtil] Error sending email to ${to}:`, error.responseCode || error.code, error.message);
            throw new Error(`Email delivery failed: ${error.message}`);
        }
    }

    public async sendOtpEmail(email: string, otp: string): Promise<void> {
        const subject = "OTP Verification - Ticket Hive";
        const text = `Your OTP for verification is: ${otp}. It will expire in 5 minutes.`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #e53e3e;">Ticket Hive Verification</h2>
                <p>Hello,</p>
                <p>Your One-Time Password (OTP) for account verification is:</p>
                <div style="font-size: 24px; font-weight: bold; background: #f7fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; letter-spacing: 5px;">
                    ${otp}
                </div>
                <p>This OTP will expire in <strong>5 minutes</strong>.</p>
                <p>If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #718096;">&copy; ${new Date().getFullYear()} Ticket Hive. All rights reserved.</p>
            </div>
        `;
        await this.sendEmail(email, subject, text, html);
    }

    public async sendResetPasswordEmail(email: string, resetUrl: string): Promise<void> {
        const subject = "Password Reset Request - Ticket Hive";
        const text = `You requested a password reset. Please use the following link to reset your password: ${resetUrl}`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #e53e3e;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Click the button below to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>Link: <a href="${resetUrl}">${resetUrl}</a></p>
                <p>This link will expire in <strong>30 minutes</strong>.</p>
                <p>If you did not request a password reset, no further action is required.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #718096;">&copy; ${new Date().getFullYear()} Ticket Hive. All rights reserved.</p>
            </div>
        `;
        await this.sendEmail(email, subject, text, html);
    }
}

export default new EmailUtil();
