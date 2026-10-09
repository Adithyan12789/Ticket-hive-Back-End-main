"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../Config/loadEnv");
require("reflect-metadata");
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailUtil {
    constructor() {
        this.transporter = null;
    }
    getCredentials() {
        const user = (process.env.EMAIL_USER ||
            process.env.SMTP_USER ||
            process.env.MAIL_USER ||
            "").trim();
        const pass = (process.env.EMAIL_PASS ||
            process.env.SMTP_PASS ||
            process.env.MAIL_PASS ||
            "").replace(/\s+/g, "");
        const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
        const port = Number(process.env.SMTP_PORT || 587);
        const from = (process.env.EMAIL_FROM || user).trim();
        return { user, pass, host, port, from };
    }
    getTransporter() {
        if (this.transporter) {
            return this.transporter;
        }
        const { user, pass, host, port } = this.getCredentials();
        if (!user || !pass) {
            throw new Error(`Email is not configured. EMAIL_USER=${user || "(missing)"}, EMAIL_PASS=${pass ? "(set)" : "(missing)"}. Set these in .env as Gmail App Password.`);
        }
        const isGmail = host.includes("gmail.com") || user.endsWith("@gmail.com");
        console.log(`[EmailUtil] Creating transporter — user: ${user}, isGmail: ${isGmail}`);
        this.transporter = nodemailer_1.default.createTransport(isGmail
            ? {
                service: "gmail",
                auth: { user, pass },
            }
            : {
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
        return this.transporter;
    }
    async verifyConnection() {
        try {
            const transporter = this.getTransporter();
            await transporter.verify();
            console.log("[EmailUtil] SMTP connection verified successfully.");
        }
        catch (error) {
            console.error("[EmailUtil] SMTP connection FAILED:", error.message);
            this.transporter = null;
            throw error;
        }
    }
    async sendEmail(to, subject, text, html) {
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
        }
        catch (error) {
            this.transporter = null;
            console.error(`[EmailUtil] Error sending email to ${to}:`, error.responseCode || error.code, error.message);
            throw new Error(`Email delivery failed: ${error.message}`);
        }
    }
    async sendOtpEmail(email, otp) {
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
    async sendResetPasswordEmail(email, resetUrl) {
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
exports.default = new EmailUtil();
//# sourceMappingURL=EmailUtil.js.map