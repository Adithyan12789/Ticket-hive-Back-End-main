"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const GenerateAdminToken_1 = __importDefault(require("../Utils/GenerateAdminToken"));
const EmailUtil_1 = __importDefault(require("../Utils/EmailUtil"));
const AdminModel_1 = __importDefault(require("../Models/AdminModel"));
const inversify_1 = require("inversify");
let AdminService = class AdminService {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    async adminLoginService(email, password, res) {
        console.log("AdminService: Beginning login service logic for", email);
        const { email: adminEmail, password: adminPassword } = await this.adminRepository.authenticateAdmin(email, password);
        console.log("AdminService: Repository authentication successful");
        let _id = "";
        let existingAdmin = await AdminModel_1.default.findOne({ email: adminEmail });
        console.log("AdminService: Database lookup complete. Found:", !!existingAdmin);
        if (!existingAdmin) {
            console.log("AdminService: Admin not found in DB, creating first-time admin entry");
            const newAdmin = new AdminModel_1.default({
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
        _id = existingAdmin._id.toString();
        console.log("AdminService: Generating token for ID:", _id);
        const token = GenerateAdminToken_1.default.generateAdminToken(res, _id);
        console.log("AdminService: Token generation successful");
        return {
            _id,
            name: "Admin",
            email: adminEmail,
            token,
            isAdmin: true,
        };
    }
    async getAllUsers() {
        return this.adminRepository.getAllUsers();
    }
    async getAllTheaterOwners() {
        return await this.adminRepository.getAllTheaterOwners();
    }
    async blockUser(userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
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
    async unblockUser(userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid userId format");
        }
        try {
            const updatedUser = await this.adminRepository.updateUser(userId, {
                isBlocked: false,
            });
            return updatedUser;
        }
        catch (error) {
            console.error(`Error updating user: ${error}`);
            throw new Error("Error updating user");
        }
    }
    async blockTheaterOwner(theaterOwnerId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(theaterOwnerId)) {
            throw new Error("Invalid theaterOwnerId format");
        }
        try {
            const updatedTheaterOwner = await this.adminRepository.updatedTheaterOwner(theaterOwnerId, {
                isBlocked: true,
            });
            return updatedTheaterOwner;
        }
        catch (error) {
            console.error(`Error updating theater Owner: ${error}`);
            throw new Error("Error updating theater Owner");
        }
    }
    async unblockTheaterOwner(theaterOwnerId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(theaterOwnerId)) {
            throw new Error("Invalid theaterOwnerId format");
        }
        try {
            const updatedTheaterOwner = await this.adminRepository.updatedTheaterOwner(theaterOwnerId, {
                isBlocked: false,
            });
            return updatedTheaterOwner;
        }
        catch (error) {
            console.error(`Error updating theater Owner: ${error}`);
            throw new Error("Error updating theater Owner");
        }
    }
    async getVerificationDetails() {
        return await this.adminRepository.getPendingTheaterOwnerVerifications();
    }
    async acceptVerification(theaterId) {
        const theater = await this.adminRepository.findTheaterById(theaterId);
        if (!theater) {
            throw new Error("Theater not found");
        }
        theater.verificationStatus = "accepted";
        theater.isVerified = true;
        await this.adminRepository.saveTheater(theater);
        const theaterOwner = await this.adminRepository.findTheaterOwnerById(theater.theaterOwnerId.toString());
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
        await this.sendVerificationEmail(theaterOwner.email, "Theater Verification Approved - Ticket Hive", "Your verification request has been accepted.", html);
        return { message: "Verification accepted and email sent." };
    }
    async rejectVerification(theaterId, reason) {
        const theater = await this.adminRepository.findTheaterById(theaterId);
        if (!theater) {
            throw new Error("Theater not found");
        }
        theater.verificationStatus = "rejected";
        theater.isVerified = false;
        await this.adminRepository.saveTheater(theater);
        const theaterOwner = await this.adminRepository.findTheaterOwnerById(theater.theaterOwnerId.toString());
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
        await this.sendVerificationEmail(theaterOwner.email, "Theater Verification Update - Ticket Hive", `Your verification request has been rejected. Reason: ${reason}`, html);
        return { message: "Verification rejected and email sent." };
    }
    async getAllTicketsService() {
        const bookings = await this.adminRepository.findAllBookings();
        if (!bookings.length)
            throw new Error("No tickets found");
        return bookings.map((booking) => ({
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
    async getAllAdmins() {
        let admins = await this.adminRepository.getAllAdmins();
        return admins;
    }
    async adminLogoutService(res) {
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", "", {
            httpOnly: true,
            secure: isProduction,
            expires: new Date(0),
            sameSite: isProduction ? "none" : "lax",
            path: "/",
        });
        return { message: "Admin logged out successfully" };
    }
    async sendVerificationEmail(recipient, subject, message, html) {
        try {
            await EmailUtil_1.default.sendEmail(recipient, subject, message, html);
        }
        catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IAdminRepository")),
    __metadata("design:paramtypes", [Object])
], AdminService);
//# sourceMappingURL=AdminService.js.map