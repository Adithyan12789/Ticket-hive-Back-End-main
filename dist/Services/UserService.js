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
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const EmailUtil_1 = __importDefault(require("../Utils/EmailUtil"));
const inversify_1 = require("inversify");
const GenerateToken_1 = __importDefault(require("../Utils/GenerateToken"));
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.getUserProfile = async (userId) => {
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                profileImageName: user.profileImageName,
            };
        };
        this.updateUserProfileService = async (userId, updateData, profileImage) => {
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            if (updateData.password && updateData.currentPassword) {
                const isMatch = await user.matchPassword(updateData.currentPassword);
                if (!isMatch) {
                    throw new Error("Current password is incorrect");
                }
            }
            user.name = updateData.name || user.name;
            user.phone = updateData.phone || user.phone;
            if (updateData.password) {
                const salt = await bcryptjs_1.default.genSalt(10);
                user.password = await bcryptjs_1.default.hash(updateData.password, salt);
            }
            if (profileImage) {
                user.profileImageName = profileImage.filename || user.profileImageName;
            }
            return await this.userRepository.saveUser(user);
        };
        this.getOffersByTheaterIdService = async (theaterId) => {
            try {
                return await this.userRepository.getOffersByTheaterId(theaterId);
            }
            catch (error) {
                throw new Error("Error fetching Offers");
            }
        };
    }
    async refreshToken(refreshToken) {
        const decoded = GenerateToken_1.default.verifyRefreshToken(refreshToken);
        if (!decoded || typeof decoded === "string") {
            throw new Error("Invalid or expired refresh token");
        }
        const user = await this.userRepository.findUserById(decoded.userId);
        if (!user) {
            throw new Error("User not found");
        }
        const newAccessToken = GenerateToken_1.default.generateAccessToken(user._id.toString());
        return { accessToken: newAccessToken };
    }
    async authenticateUser(email, password) {
        const user = await this.userRepository.findUserByEmail(email);
        console.log("[authenticateUser] Found user:", user ? user.email : "not found");
        if (!user) {
            throw new Error("Invalid Email or Password");
        }
        if (user.isBlocked) {
            throw new Error("Your account is blocked");
        }
        if (user.otpVerified === false) {
            throw new Error("Email not verified. Please verify your OTP first.");
        }
        const passwordMatch = await user.matchPassword(password);
        console.log("[authenticateUser] Password match:", passwordMatch);
        if (passwordMatch) {
            return user;
        }
        throw new Error("Invalid Email or Password");
    }
    async handleGoogleLogin(name, email) {
        let user = await this.userRepository.findUserByEmail(email);
        if (user) {
            return user;
        }
        user = await this.userRepository.createUser({
            name,
            email,
            otp: "",
            phone: "",
            password: "",
        });
        if (!user) {
            throw new Error("Invalid user data");
        }
        user.isNew = true;
        return user;
    }
    async registerUserService(name, email, password, phone) {
        const existingUser = await this.userRepository.findUserByEmail(email);
        if (existingUser) {
            if (!existingUser.otpVerified) {
                const otp = crypto_1.default.randomInt(100000, 999999).toString();
                const salt = await bcryptjs_1.default.genSalt(10);
                const hashedPassword = await bcryptjs_1.default.hash(password, salt);
                const updatedUser = await this.userRepository.updateUserOtpAndPassword(email, otp, hashedPassword);
                console.log("Re-registration: updated OTP and password for unverified user");
                await EmailUtil_1.default.sendOtpEmail(email, otp);
                return updatedUser;
            }
            throw new Error("Email already exists.");
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const newUser = await this.userRepository.createUser({
            name,
            email,
            phone,
            password: hashedPassword,
            otp,
            otpVerified: false,
            otpGeneratedAt: new Date(),
            otpExpires: new Date(Date.now() + 5 * 60 * 1000),
        });
        await EmailUtil_1.default.sendOtpEmail(email, otp);
        return newUser;
    }
    async verifyOtpService(email, otp) {
        const user = await this.userRepository.findUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        console.log(`Verifying OTP: Submitted: ${otp}, Stored: ${user.otp}`);
        console.log(`User Timestamps: otpExpires: ${user.otpExpires}, otpGeneratedAt: ${user.otpGeneratedAt}`);
        const currentTime = new Date().getTime();
        if (user.otpExpires) {
            if (currentTime > new Date(user.otpExpires).getTime()) {
                throw new Error("OTP expired");
            }
        }
        else {
            if (!user.otpGeneratedAt) {
                console.log("Warning: otpGeneratedAt is missing for fallback check.");
            }
            else {
                const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
                const otpGeneratedAt = new Date(user.otpGeneratedAt).getTime();
                if (currentTime - otpGeneratedAt > OTP_EXPIRATION_TIME) {
                    throw new Error("OTP expired");
                }
            }
        }
        if (String(user.otp) === String(otp)) {
            user.otpVerified = true;
            await user.save();
            return true;
        }
        throw new Error("Incorrect OTP");
    }
    async resendOtpService(email) {
        const user = await this.userRepository.findUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const updatedUser = await this.userRepository.updateUserOtp(email, otp);
        await EmailUtil_1.default.sendOtpEmail(updatedUser.email, otp);
        return updatedUser;
    }
    async forgotPasswordService(email) {
        const user = await this.userRepository.findUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
        await user.save();
        return resetToken;
    }
    async resetPasswordService(resetToken, password) {
        const user = await this.userRepository.findUserByResetToken(resetToken);
        if (!user) {
            throw new Error("Invalid or expired token");
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return true;
    }
    async updateLocation(userId, city, latitude, longitude) {
        try {
            return await this.userRepository.updateLocation(userId, city, latitude, longitude);
        }
        catch (error) {
            throw new Error("Service: Error updating location");
        }
    }
    async logoutUserService() {
        return true;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IUserRepository")),
    __metadata("design:paramtypes", [Object])
], UserService);
//# sourceMappingURL=UserService.js.map