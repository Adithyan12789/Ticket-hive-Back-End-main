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
exports.UserController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const EmailUtil_1 = __importDefault(require("../Utils/EmailUtil"));
const GenerateToken_1 = __importDefault(require("../Utils/GenerateToken"));
const bookingModel_1 = require("../Models/bookingModel");
const inversify_1 = require("inversify");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
        this.refreshToken = (0, express_async_handler_1.default)(async (req, res) => {
            const refreshToken = req.cookies["refreshToken"];
            if (!refreshToken) {
                res.status(401).json({ message: "No refresh token provided" });
                return;
            }
            try {
                const { accessToken } = await this.userService.refreshToken(refreshToken);
                const isProduction = process.env.NODE_ENV === "production";
                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? "none" : "lax",
                    maxAge: 15 * 60 * 1000,
                    path: "/",
                });
                res.status(200).json({ message: "Token refreshed successfully" });
            }
            catch (error) {
                console.error("Error refreshing token:", error);
                res.status(401).json({ message: error });
            }
        });
        this.authUser = (0, express_async_handler_1.default)(async (req, res) => {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: "Email and password are required" });
                return;
            }
            try {
                const user = await this.userService.authenticateUser(email, password);
                const accessToken = GenerateToken_1.default.generateAccessToken(user._id.toString());
                console.log("controller accessToken: ", accessToken);
                const refreshToken = GenerateToken_1.default.generateRefreshToken(user._id.toString());
                console.log("controller refreshToken: ", refreshToken);
                GenerateToken_1.default.setTokenCookies(res, accessToken, refreshToken);
                res.status(200).json({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    if (err.message === "Your account is blocked") {
                        res.status(401).json({
                            message: "Your account is blocked. Please contact support.",
                        });
                    }
                    else if (err.message === "Email not verified. Please verify your OTP first.") {
                        res.status(403).json({ message: "Email not verified. Please verify your OTP first." });
                    }
                    else if (err.message === "Invalid Email or Password") {
                        res.status(401).json({ message: "Invalid email or password" });
                    }
                    else {
                        res
                            .status(500)
                            .json({ message: "An error occurred during authentication" });
                    }
                }
                else {
                    res
                        .status(500)
                        .json({ message: "An error occurred during authentication" });
                }
            }
        });
        this.googleLogin = (0, express_async_handler_1.default)(async (req, res) => {
            const { googleName: name, googleEmail: email } = req.body;
            if (!email || !name) {
                res.status(400).json({ message: "Google Name and Email are required" });
                return;
            }
            try {
                const user = await this.userService.handleGoogleLogin(name, email);
                const accessToken = GenerateToken_1.default.generateAccessToken(user._id.toString());
                const refreshToken = GenerateToken_1.default.generateRefreshToken(user._id.toString());
                GenerateToken_1.default.setTokenCookies(res, accessToken, refreshToken);
                const statusCode = user.isNew ? 201 : 200;
                res.status(statusCode).json({
                    success: true,
                    data: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                    },
                });
            }
            catch (error) {
                res.status(500).json({
                    message: "Internal server error",
                    error: error.message,
                });
            }
        });
        this.registerUser = (0, express_async_handler_1.default)(async (req, res) => {
            const { name, email, password, phone } = req.body;
            try {
                const user = await this.userService.registerUserService(name, email, password, phone);
                const otpSent = !user.otpVerified;
                if (!otpSent) {
                    const accessToken = GenerateToken_1.default.generateAccessToken(user._id.toString());
                    const refreshToken = GenerateToken_1.default.generateRefreshToken(user._id.toString());
                    GenerateToken_1.default.setTokenCookies(res, accessToken, refreshToken);
                }
                res.status(201).json({
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    otpSent,
                    message: otpSent
                        ? "User registered successfully. OTP sent."
                        : "User already registered but OTP not verified.",
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    if (err.message === "Email already exists.") {
                        res
                            .status(400)
                            .json({ message: "This email is already exist" });
                    }
                    else if (err.message === "Email exists but OTP is not verified.") {
                        res
                            .status(400)
                            .json({ message: "Email exists but OTP is not verified." });
                    }
                    else if (err.message.includes("Email delivery failed") ||
                        err.message.includes("Email is not configured")) {
                        res.status(500).json({
                            message: "Could not send OTP email. Please try again or contact support.",
                            error: err.message,
                        });
                    }
                    else {
                        res
                            .status(500)
                            .json({ message: "An error occurred during registration", error: err.message });
                    }
                }
                else {
                    res.status(500).json({ message: "An unexpected error occurred", error: String(err) });
                }
            }
        });
        this.verifyOTP = (0, express_async_handler_1.default)(async (req, res) => {
            const { email, otp } = req.body;
            try {
                await this.userService.verifyOtpService(email, otp);
                res.status(200).json({ message: "OTP verified successfully" });
            }
            catch (err) {
                if (err instanceof Error && err.message === "Incorrect OTP") {
                    res.status(400).json({ message: "Incorrect OTP" });
                }
                else if (err instanceof Error && err.message === "OTP expired") {
                    res
                        .status(400)
                        .json({ message: "OTP has expired. Please request a new one" });
                }
                else {
                    res
                        .status(500)
                        .json({ message: "An error occurred during OTP verification", error: String(err) });
                }
            }
        });
        this.resendOtp = (0, express_async_handler_1.default)(async (req, res) => {
            const { email } = req.body;
            try {
                await this.userService.resendOtpService(email);
                res.status(200).json({ message: "OTP resent successfully" });
            }
            catch (err) {
                if (err instanceof Error && err.message === "User not found") {
                    res.status(404).json({ message: "User with this email not found" });
                }
                else if (err instanceof Error &&
                    err.message === "Failed to send OTP") {
                    res
                        .status(500)
                        .json({ message: "Failed to resend OTP. Please try again" });
                }
                else {
                    res.status(500).json({ message: "An unexpected error occurred", error: String(err) });
                }
            }
        });
        this.forgotPassword = (0, express_async_handler_1.default)(async (req, res) => {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ message: "Email is required" });
                return;
            }
            try {
                const resetToken = await this.userService.forgotPasswordService(email);
                const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
                const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
                await EmailUtil_1.default.sendResetPasswordEmail(email, resetUrl);
                res.status(200).json({ message: "Password reset email sent" });
            }
            catch (err) {
                if (err instanceof Error && err.message === "User not found") {
                    res.status(404).json({ message: "User with this email not found" });
                }
                else if (err instanceof Error &&
                    err.message === "Failed to send email") {
                    res
                        .status(500)
                        .json({ message: "Failed to send reset email. Please try again" });
                }
                else {
                    res.status(500).json({
                        message: "An error occurred during password reset request",
                    });
                }
            }
        });
        this.resetPassword = (0, express_async_handler_1.default)(async (req, res) => {
            const { password } = req.body;
            const resetToken = req.params.token;
            if (!resetToken || !password) {
                res.status(400).json({ message: "Token and password are required" });
                return;
            }
            try {
                await this.userService.resetPasswordService(resetToken, password);
                res.status(200).json({ message: "Password reset successfully" });
            }
            catch (err) {
                if (err instanceof Error &&
                    err.message === "Invalid or expired token") {
                    res.status(400).json({ message: "Invalid or expired token" });
                }
                else {
                    res
                        .status(500)
                        .json({ message: "An error occurred during password reset" });
                }
            }
        });
        this.saveLocationController = (0, express_async_handler_1.default)(async (req, res) => {
            if (!req.user) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { city, latitude, longitude } = req.body;
            if (latitude == null || longitude == null) {
                res
                    .status(400)
                    .json({ message: "Latitude and longitude are required" });
                return;
            }
            try {
                const updatedUser = await this.userService.updateLocation(req.user._id.toString(), city, latitude, longitude);
                if (!updatedUser) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.status(200).json({
                    message: "Location updated successfully",
                    latitude: updatedUser.latitude,
                    longitude: updatedUser.longitude,
                });
            }
            catch (err) {
                res
                    .status(500)
                    .json({ message: "An error occurred while saving location" });
            }
        });
        this.getUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
            if (!req.user) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const user = await this.userService.getUserProfile(req.user._id);
            res.status(200).json(user);
        });
        this.updateUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
            if (!req.user) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            try {
                const updateData = { ...req.body };
                const fileData = req.file
                    ? { filename: req.file.filename }
                    : { filename: undefined };
                if (updateData.password) {
                    if (!updateData.currentPassword) {
                        res.status(400).json({ message: "Current password is required" });
                        return;
                    }
                }
                const updatedUser = await this.userService.updateUserProfileService(req.user._id, updateData, fileData);
                res.status(200).json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    phone: updatedUser.phone,
                    profileImageName: updatedUser.profileImageName,
                });
            }
            catch (err) {
                if (err instanceof Error &&
                    err.message === "Current password is incorrect") {
                    res.status(404).json({ message: "Current password is incorrect" });
                }
                else {
                    res.status(500).json({
                        message: "An error occurred",
                    });
                }
            }
        });
        this.getOffersByTheaterId = (0, express_async_handler_1.default)(async (req, res) => {
            const { theaterId } = req.params;
            const userId = req.user?._id;
            try {
                const offers = await this.userService.getOffersByTheaterIdService(theaterId);
                if (!offers || offers.length === 0) {
                    res.status(200).json([]);
                    return;
                }
                const bookings = await bookingModel_1.Booking.find({ user: userId })
                    .select("offer")
                    .exec();
                const usedOfferIds = bookings
                    .map((booking) => booking.offer?.toString())
                    .filter((offerId) => !!offerId);
                const filteredOffers = offers.filter((offer) => !usedOfferIds.includes(offer.id.toString()));
                res.status(200).json(filteredOffers);
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: error?.message || "Internal server error" });
            }
        });
        this.logoutUser = (0, express_async_handler_1.default)(async (req, res) => {
            await this.userService.logoutUserService();
            const isProduction = process.env.NODE_ENV === "production";
            res.cookie("accessToken", "", {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                expires: new Date(0),
                path: "/",
            });
            res.cookie("refreshToken", "", {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                expires: new Date(0),
                path: "/",
            });
            res.status(200).json({ message: "User Logged out" });
        });
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IUserService")),
    __metadata("design:paramtypes", [Object])
], UserController);
//# sourceMappingURL=UserController.js.map