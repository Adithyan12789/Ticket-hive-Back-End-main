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
exports.UserRepository = void 0;
const bookingModel_1 = require("../Models/bookingModel");
const OffersModel_1 = require("../Models/OffersModel");
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const inversify_1 = require("inversify");
const BaseRepository_1 = require("./Base/BaseRepository");
let UserRepository = class UserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(UserModel_1.default);
        this.userModel = UserModel_1.default;
    }
    async findUserByEmail(email) {
        return await UserModel_1.default.findOne({ email });
    }
    async saveUser(userData) {
        if (typeof userData.save === "function") {
            return await userData.save();
        }
        const user = new UserModel_1.default(userData);
        return await user.save();
    }
    async updateLocation(userId, city, latitude, longitude) {
        try {
            return await UserModel_1.default.findByIdAndUpdate(userId, { city, latitude, longitude }, { new: true });
        }
        catch (error) {
            throw new Error("Error updating location");
        }
    }
    async updateUserOtp(email, otp) {
        const user = await UserModel_1.default.findOneAndUpdate({ email }, {
            otp,
            otpVerified: false,
            otpGeneratedAt: new Date(),
            otpExpires: new Date(Date.now() + 5 * 60 * 1000),
        }, { new: true });
        if (!user) {
            throw new Error("Failed to update OTP for user");
        }
        return user;
    }
    async updateUserOtpAndPassword(email, otp, hashedPassword) {
        const user = await UserModel_1.default.findOneAndUpdate({ email }, {
            otp,
            password: hashedPassword,
            otpVerified: false,
            otpGeneratedAt: new Date(),
            otpExpires: new Date(Date.now() + 5 * 60 * 1000),
        }, { new: true });
        if (!user) {
            throw new Error("Failed to update OTP and password for user");
        }
        return user;
    }
    async findUserByResetToken(resetToken) {
        return await UserModel_1.default.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });
    }
    async createUser(userData) {
        const user = new UserModel_1.default(userData);
        return await user.save();
    }
    async updateUser(userId, updates) {
        return await UserModel_1.default.findByIdAndUpdate(userId, updates, { new: true });
    }
    async findUserById(userId) {
        return await UserModel_1.default.findById(userId);
    }
    async findBookingsByUserId(userId) {
        return await bookingModel_1.Booking.find({ user: userId })
            .populate("movie theater screen")
            .lean();
    }
    async findBookingById(bookingId) {
        return await bookingModel_1.Booking.findById(bookingId).populate("movie theater screen");
    }
    async deleteBookingById(bookingId) {
        return await bookingModel_1.Booking.findByIdAndDelete(bookingId);
    }
    async getOffersByTheaterId(theaterId) {
        return await OffersModel_1.Offer.find({ applicableTheaters: theaterId })
            .populate("applicableTheaters", "name location")
            .populate("createdBy", "name email ")
            .exec();
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], UserRepository);
exports.default = new UserRepository();
//# sourceMappingURL=UserRepo.js.map