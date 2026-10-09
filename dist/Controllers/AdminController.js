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
exports.AdminController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const inversify_1 = require("inversify");
const express_async_handler_2 = __importDefault(require("express-async-handler"));
const MoviesModel_1 = require("../Models/MoviesModel");
const OffersModel_1 = require("../Models/OffersModel");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
        this.adminLogin = (0, express_async_handler_1.default)(async (req, res) => {
            console.log("AdminController: Received login request. Body keys:", Object.keys(req.body || {}));
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: "Email and password are required" });
                return;
            }
            try {
                console.log(`Admin login attempt for email: ${email}`);
                const adminData = await this.adminService.adminLoginService(email, password, res);
                console.log("Admin login successful");
                res.status(200).json(adminData);
            }
            catch (error) {
                console.error(`Admin login failed: ${error.message}`);
                res.status(400).json({ message: error.message });
            }
        });
        this.getAllUsers = (0, express_async_handler_2.default)(async (req, res) => {
            const users = await this.adminService.getAllUsers();
            res.status(200).json(users);
        });
        this.getAllTheaterOwners = (0, express_async_handler_2.default)(async (req, res) => {
            const theaterOwners = await this.adminService.getAllTheaterOwners();
            res.status(200).json(theaterOwners);
        });
        this.blockUserController = (0, express_async_handler_2.default)(async (req, res) => {
            try {
                const { userId } = req.body;
                if (!userId) {
                    res.status(400).json({ message: "userId is required" });
                    return;
                }
                const user = await this.adminService.blockUser(userId);
                if (user) {
                    res.status(200).json({ message: "User blocked successfully", user });
                }
                else {
                    res.status(404).json({ message: "User not found" });
                }
            }
            catch (error) {
                console.error("Error blocking user:", error.message);
                res
                    .status(500)
                    .json({ message: error.message || "Internal Server Error" });
            }
        });
        this.unblockUserController = (0, express_async_handler_2.default)(async (req, res, next) => {
            try {
                const { userId } = req.body;
                if (!userId) {
                    res.status(400).json({ message: "userId is required" });
                    return;
                }
                const user = await this.adminService.unblockUser(userId);
                if (user) {
                    res
                        .status(200)
                        .json({ message: "User unblocked successfully", user });
                }
                else {
                    res.status(404).json({ message: "User not found" });
                }
            }
            catch (error) {
                console.error("Error unblocking user:", error);
                res.status(500).json({ message: "Error unblocking user" });
            }
        });
        this.blockTheaterOwnerController = (0, express_async_handler_2.default)(async (req, res, next) => {
            try {
                const { theaterOwnerId } = req.body;
                if (!theaterOwnerId) {
                    res.status(400).json({ message: "TheaterOwnerId is required" });
                    return;
                }
                const theaterOwner = await this.adminService.blockTheaterOwner(theaterOwnerId);
                if (theaterOwner) {
                    res.status(200).json({
                        message: "Theater Owner blocked successfully",
                        theaterOwner,
                    });
                }
                else {
                    res.status(404).json({ message: "Theater Owner not found" });
                }
            }
            catch (error) {
                console.error("Error blocking theater owner:", error);
                res.status(500).json({ message: "Error blocking theater owner" });
            }
        });
        this.unblockTheaterOwnerController = (0, express_async_handler_2.default)(async (req, res, next) => {
            try {
                const { theaterOwnerId } = req.body;
                if (!theaterOwnerId) {
                    res.status(400).json({ message: "TheaterOwnerId is required" });
                    return;
                }
                const theaterOwner = await this.adminService.unblockTheaterOwner(theaterOwnerId);
                if (theaterOwner) {
                    res.status(200).json({
                        message: "Theater Owner unblocked successfully",
                        theaterOwner,
                    });
                }
                else {
                    res.status(404).json({ message: "Theater Owner not found" });
                }
            }
            catch (error) {
                console.error("Error unblocking theater owner:", error);
                res.status(500).json({ message: "Error unblocking theater owner" });
            }
        });
        this.getVerificationDetails = (0, express_async_handler_2.default)(async (req, res) => {
            const theaters = await this.adminService.getVerificationDetails();
            res.status(200).json(theaters);
        });
        this.acceptVerification = (0, express_async_handler_2.default)(async (req, res) => {
            try {
                await this.adminService.acceptVerification(req.params.theaterId);
                res.json({ message: "Verification accepted" });
            }
            catch (error) {
                console.error("Error accepting verification:", error);
                res.status(500).json({ message: "Server Error" });
            }
        });
        this.rejectVerification = (0, express_async_handler_2.default)(async (req, res) => {
            try {
                const { adminId } = req.params;
                const { reason } = req.body;
                await this.adminService.rejectVerification(adminId, reason);
                res.json({ message: "Verification rejected" });
            }
            catch (error) {
                console.error("Error rejecting verification:", error);
                res.status(500).json({ message: "Server Error" });
            }
        });
        this.getAllTickets = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const tickets = await this.adminService.getAllTicketsService();
                if (!tickets || tickets.length === 0) {
                    res.status(404).json({ message: "No tickets found for this user" });
                    return;
                }
                const ticketsWithMovieDetails = await Promise.all(tickets.map(async (ticket) => {
                    const movie = await MoviesModel_1.Movie.findById(ticket.movieId).exec();
                    const offer = await OffersModel_1.Offer.findById(ticket.offerId).exec();
                    return {
                        ticket,
                        movieDetails: movie
                            ? {
                                title: movie.title,
                                poster: movie.posters,
                                duration: movie.duration,
                                genre: movie.genres,
                            }
                            : null,
                        offerDetails: offer
                            ? {
                                offerName: offer.offerName,
                                description: offer.description,
                                discountValue: offer.discountValue,
                                minPurchaseAmount: offer.minPurchaseAmount,
                                validityStart: offer.validityStart,
                                validityEnd: offer.validityEnd,
                            }
                            : null,
                    };
                }));
                res.status(200).json({
                    success: true,
                    tickets: ticketsWithMovieDetails,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to retrieve tickets",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
        this.getAdmins = (0, express_async_handler_1.default)(async (req, res) => {
            const admins = await this.adminService.getAllAdmins();
            res.status(200).json(admins);
        });
        this.adminLogout = (0, express_async_handler_1.default)(async (req, res) => {
            const result = this.adminService.adminLogoutService(res);
            res.status(200).json(result);
        });
    }
};
exports.AdminController = AdminController;
exports.AdminController = AdminController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IAdminService")),
    __metadata("design:paramtypes", [Object])
], AdminController);
//# sourceMappingURL=AdminController.js.map