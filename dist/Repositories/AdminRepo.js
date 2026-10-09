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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const TheaterOwnerModel_1 = __importDefault(require("../Models/TheaterOwnerModel"));
const TheaterDetailsModel_1 = __importDefault(require("../Models/TheaterDetailsModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const bookingModel_1 = require("../Models/bookingModel");
const AdminModel_1 = __importDefault(require("../Models/AdminModel"));
const inversify_1 = require("inversify");
const BaseRepository_1 = require("./Base/BaseRepository");
let AdminRepository = class AdminRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(AdminModel_1.default);
        this.adminModel = AdminModel_1.default;
    }
    async authenticateAdmin(email, password) {
        const adminEmail = process.env.ADMIN_EMAIL || "";
        const adminPassword = process.env.ADMIN_PASSWORD || "";
        console.log("Admin Auth Process - Env check:", {
            emailExists: !!process.env.ADMIN_EMAIL,
            passExists: !!process.env.ADMIN_PASSWORD
        });
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            console.error("CRITICAL: Admin credentials missing in process.env");
            throw new Error("Admin credentials not configured on server");
        }
        if (email.trim() !== adminEmail.trim() || password.trim() !== adminPassword.trim()) {
            console.warn("Auth mismatch: Received", { email });
            throw new Error("Invalid Admin Email or Password");
        }
        return { email: adminEmail, password: adminPassword };
    }
    async getAdminCredentials() {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
            throw new Error("Admin credentials are not configured properly");
        }
        return { adminEmail, adminPassword };
    }
    async getAllUsers() {
        try {
            return await UserModel_1.default.find({}, { name: 1, email: 1, phone: 1, isBlocked: 1 });
        }
        catch (error) {
            console.error("Error fetching users:", error);
            throw new Error("Error fetching users");
        }
    }
    async getAllTheaterOwners() {
        try {
            return await TheaterOwnerModel_1.default.find({}, { name: 1, email: 1, phone: 1, isBlocked: 1 });
        }
        catch (error) {
            console.error("Error fetching theater owners:", error);
            throw new Error("Error fetching theater owners");
        }
    }
    async findAllBookings() {
        try {
            return await bookingModel_1.Booking.find({})
                .populate("user", "name email")
                .populate("movie theater screen offer")
                .lean();
        }
        catch (error) {
            console.error("Error fetching bookings:", error);
            throw new Error("Error fetching bookings");
        }
    }
    async updateUser(userId, userData) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new Error("Invalid userId format");
            }
            const user = await UserModel_1.default.findByIdAndUpdate(userId, userData, {
                new: true,
            });
            return user;
        }
        catch (error) {
            console.error("Error in updateUser:", error.message);
            throw new Error("Error updating user");
        }
    }
    async updatedTheaterOwner(theaterOwnerId, data) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(theaterOwnerId)) {
                throw new Error("Invalid theaterOwnerId format");
            }
            const theaterOwner = await TheaterOwnerModel_1.default.findById(theaterOwnerId);
            if (!theaterOwner) {
                throw new Error("Theater owner not found");
            }
            Object.assign(theaterOwner, data);
            return await theaterOwner.save();
        }
        catch (error) {
            console.error("Error updating theater owner:", error.message);
            throw new Error("Error updating theater owner");
        }
    }
    async getPendingTheaterOwnerVerifications() {
        try {
            return await TheaterDetailsModel_1.default.find({ verificationStatus: "pending" }).select("-password");
        }
        catch (error) {
            console.error("Error fetching pending theater verifications:", error);
            throw new Error("Error fetching pending theater verifications");
        }
    }
    async findTheaterOwnerById(id) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid ID format");
            }
            return await TheaterOwnerModel_1.default.findById(id);
        }
        catch (error) {
            console.error(`Error finding Theater Owner with ID: ${id}`, error);
            throw new Error("Error finding Theater Owner");
        }
    }
    async findTheaterById(id) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid ID format");
            }
            return await TheaterDetailsModel_1.default.findById(id);
        }
        catch (error) {
            console.error(`Error finding Theater with ID: ${id}`, error);
            throw new Error("Error finding Theater");
        }
    }
    async saveTheater(theater) {
        try {
            return await theater.save();
        }
        catch (error) {
            console.error("Error saving Theater:", error);
            throw new Error("Error saving Theater");
        }
    }
    async getAllAdmins() {
        try {
            return await AdminModel_1.default.find({});
        }
        catch (error) {
            console.error("Error fetching admins:", error);
            throw new Error("Error fetching admins");
        }
    }
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], AdminRepository);
exports.default = AdminRepository;
//# sourceMappingURL=AdminRepo.js.map