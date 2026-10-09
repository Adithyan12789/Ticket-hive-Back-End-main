import mongoose, { Types } from "mongoose";
import AdminRepository from "../Repositories/AdminRepo";
import AdminTokenService from "../Utils/GenerateAdminToken";
import { Request, Response } from "express";
import EmailUtil from "../Utils/EmailUtil";
import Admin from "../Models/AdminModel";
import { inject, injectable } from "inversify";
import { IAdminRepository } from "../Interface/IAdmin/IRepository";
import { AdminLogin } from "../types/adminTypes";
import { IUser } from "../Models/UserModel";
export interface BookingDetails {
  totalPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  bookingDate: Date;
  movie: any;
  screen: any;
  offer: any;
  _id: string;
  bookingId: string;
  user: { _id: string; name: string; email: string };
  theater: { _id: string; name: string; images: string[]; addressLine1: string; city: string; state: string; pincode: string };
  showTime: string;
  seats: string[];
  status: "pending" | "completed" | "cancelled" | "failed";
}

@injectable()
export class AdminService {
  constructor(
    @inject("IAdminRepository") private adminRepository: IAdminRepository
  ) { }

  public async adminLoginService(
    email: string,
    password: string,
    res: Response
  ): Promise<AdminLogin> {
    console.log("AdminService: Beginning login service logic for", email);

    // Authenticate admin credentials via the repository
    const { email: adminEmail, password: adminPassword } =
      await this.adminRepository.authenticateAdmin(email, password);
    console.log("AdminService: Repository authentication successful");

    let _id = "";
    let existingAdmin = await Admin.findOne({ email: adminEmail });
    console.log("AdminService: Database lookup complete. Found:", !!existingAdmin);

    // If admin does not exist, create a new admin
    if (!existingAdmin) {
      console.log("AdminService: Admin not found in DB, creating first-time admin entry");
      const newAdmin = new Admin({
        name: "Admin",
        email: adminEmail,
        password: adminPassword,
      });

      await newAdmin.save();
      existingAdmin = newAdmin;
      console.log("AdminService: New admin entry saved successfully");
    }

    if (!existingAdmin || !existingAdmin._id) {
      console.error("AdminService: Admin object or ID is missing after DB operations");
      throw new Error("Database error: Could not retrieve Admin ID");
    }

    _id = (existingAdmin._id as mongoose.Types.ObjectId).toString();
    console.log("AdminService: Generating token for ID:", _id);

    const token = AdminTokenService.generateAdminToken(res, _id);
    console.log("AdminService: Token generation successful");

    return {
      _id,
      name: "Admin",
      email: adminEmail,
      token,
      isAdmin: true,
    };
  }

  public async getAllUsers() {
    return this.adminRepository.getAllUsers();
  }

  public async getAllTheaterOwners() {
    return await this.adminRepository.getAllTheaterOwners();
  }

  // AdminService.ts
  public async blockUser(userId: string): Promise<any | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }

    const updatedUser = await this.adminRepository.updateUser(userId, {
      isBlocked: true,
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  public async unblockUser(userId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }

    try {
      const updatedUser = await this.adminRepository.updateUser(userId, {
        isBlocked: false,
      });

      return updatedUser;
    } catch (error) {
      console.error(`Error updating user: ${error}`);
      throw new Error("Error updating user");
    }
  }

  public async blockTheaterOwner(theaterOwnerId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
      throw new Error("Invalid theaterOwnerId format");
    }

    try {
      const updatedTheaterOwner =
        await this.adminRepository.updatedTheaterOwner(theaterOwnerId, {
          isBlocked: true,
        });

      return updatedTheaterOwner;
    } catch (error) {
      console.error(`Error updating theater Owner: ${error}`);
      throw new Error("Error updating theater Owner");
    }
  }

  public async unblockTheaterOwner(theaterOwnerId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
      throw new Error("Invalid theaterOwnerId format");
    }

    try {
      const updatedTheaterOwner =
        await this.adminRepository.updatedTheaterOwner(theaterOwnerId, {
          isBlocked: false,
        });

      return updatedTheaterOwner;
    } catch (error) {
      console.error(`Error updating theater Owner: ${error}`);
      throw new Error("Error updating theater Owner");
    }
  }

  public async getVerificationDetails() {
    return await this.adminRepository.getPendingTheaterOwnerVerifications();
  }

  public async acceptVerification(
    theaterId: string
  ): Promise<{ message: string }> {
    const theater = await this.adminRepository.findTheaterById(theaterId);

    if (!theater) {
      throw new Error("Theater not found");
    }

    theater.verificationStatus = "accepted";
    theater.isVerified = true;
    await this.adminRepository.saveTheater(theater);

    const theaterOwner = await this.adminRepository.findTheaterOwnerById(
      theater.theaterOwnerId.toString()
    );
    if (!theaterOwner) {
      throw new Error("Theater Owner not found");
    }

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2f855a;">Verification Approved!</h2>
        <p>Hello <strong>${theaterOwner.name}</strong>,</p>
        <p>Great news! Your theater <strong>${theater.name}</strong> has been successfully verified.</p>
        <p>You can now log in to the partner portal and start managing your screens and shows.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/theater-login" style="background-color: #2f855a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Go to Portal
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #718096;">&copy; ${new Date().getFullYear()} Ticket Hive Partner. All rights reserved.</p>
      </div>
    `;
    await this.sendVerificationEmail(
      theaterOwner.email,
      "Theater Verification Approved - Ticket Hive",
      "Your verification request has been accepted.",
      html
    );
    return { message: "Verification accepted and email sent." };
  }

  public async rejectVerification(
    theaterId: string,
    reason: string
  ): Promise<{ message: string }> {
    const theater = await this.adminRepository.findTheaterById(theaterId);
    if (!theater) {
      throw new Error("Theater not found");
    }

    theater.verificationStatus = "rejected";
    theater.isVerified = false;
    await this.adminRepository.saveTheater(theater);

    const theaterOwner = await this.adminRepository.findTheaterOwnerById(
      theater.theaterOwnerId.toString()
    );
    if (!theaterOwner) {
      throw new Error("Theater Owner not found");
    }

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #e53e3e;">Verification Rejected</h2>
        <p>Hello <strong>${theaterOwner.name}</strong>,</p>
        <p>We regret to inform you that your verification request for <strong>${theater.name}</strong> has been rejected.</p>
        <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0;">
          <strong>Reason for rejection:</strong><br/>
          ${reason}
        </div>
        <p>Please address the issues mentioned above and re-submit your verification details in the portal.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #718096;">&copy; ${new Date().getFullYear()} Ticket Hive Partner. All rights reserved.</p>
      </div>
    `;
    await this.sendVerificationEmail(
      theaterOwner.email,
      "Theater Verification Update - Ticket Hive",
      `Your verification request has been rejected. Reason: ${reason}`,
      html
    );
    return { message: "Verification rejected and email sent." };
  }

  public async getAllTicketsService() {
    const bookings = await this.adminRepository.findAllBookings();

    if (!bookings.length) throw new Error("No tickets found");

    return bookings.map((booking: BookingDetails) => ({
      bookingId: booking._id,
      userId: booking.user._id,
      userName: booking.user.name,
      userEmail: booking.user.email,
      screenId: booking.screen._id,
      movieId: booking.movie._id,
      offerId: booking.offer?._id,
      movieTitle: booking.movie.title,
      theaterName: booking.theater.name,
      images: booking.theater.images,
      address: `${booking.theater.addressLine1}, ${booking.theater.city}, ${booking.theater.state} - ${booking.theater.pincode}`,
      screenName: booking.screen.screenNumber,
      seats: booking.seats,
      showTime: booking.showTime,
      bookingDate: booking.bookingDate,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      totalPrice: booking.totalPrice,
    }));
  }

  public async getAllAdmins() {
    let admins = await this.adminRepository.getAllAdmins();
    return admins;
  }

  public async adminLogoutService(res: Response) {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      sameSite: "strict",
    });
    return { message: "Admin logged out successfully" };
  }

  private async sendVerificationEmail(
    recipient: string,
    subject: string,
    message: string,
    html?: string
  ) {
    try {
      await EmailUtil.sendEmail(recipient, subject, message, html);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}
