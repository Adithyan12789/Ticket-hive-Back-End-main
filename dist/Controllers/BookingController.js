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
exports.BookingController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const BookingService_1 = require("../Services/BookingService");
const MoviesModel_1 = require("../Models/MoviesModel");
const inversify_1 = require("inversify");
let BookingController = class BookingController {
    constructor(bookingService, notificationService, walletService) {
        this.bookingService = bookingService;
        this.notificationService = notificationService;
        this.walletService = walletService;
        this.createBooking = (0, express_async_handler_1.default)(async (req, res) => {
            const { userId, scheduleId, theaterId, seatIds, screenId, bookingDate, showTime, totalPrice, paymentStatus, paymentMethod, convenienceFee, offerId, movieId, } = req.body;
            if (!movieId ||
                !scheduleId ||
                !theaterId ||
                !screenId ||
                !seatIds ||
                !showTime ||
                !userId ||
                !totalPrice ||
                !paymentStatus ||
                !paymentMethod ||
                !convenienceFee ||
                !bookingDate) {
                res.status(400).json({ message: "Missing required fields" });
                return;
            }
            try {
                const movieTitle = await (0, BookingService_1.getMovieTitleById)(movieId);
                if (!movieTitle) {
                    res.status(404).json({ message: "Movie not found" });
                    return;
                }
                if (paymentMethod === "wallet") {
                    const walletBalance = await this.walletService.getWalletBalance(userId);
                    if (walletBalance < totalPrice) {
                        res.status(400).json({ message: "Insufficient wallet balance" });
                        return;
                    }
                    const description = `Payment for booking "${movieTitle}"`;
                    await this.walletService.deductAmountFromWallet(userId, totalPrice, description);
                }
                const nextDay = new Date(bookingDate);
                nextDay.setDate(nextDay.getDate() + 1);
                const formattedNextDay = nextDay.toISOString();
                const booking = await this.bookingService.createBookingService(movieId, scheduleId, theaterId, screenId, seatIds, userId, offerId, totalPrice, showTime, paymentStatus, paymentMethod, convenienceFee, formattedNextDay);
                await this.notificationService.addNotification(userId, `Your ticket for the movie "${movieTitle}" has been booked successfully.`);
                if (paymentMethod === "wallet") {
                    const cashbackPercentage = 10;
                    const cashbackAmount = (totalPrice * cashbackPercentage) / 100;
                    await this.walletService.addCashbackToWallet(userId, cashbackAmount, `Cashback for booking "${movieTitle}"`);
                    await this.notificationService.addNotification(userId, `You've received a cashback of ₹${cashbackAmount.toFixed(2)} for your booking of "${movieTitle}".`);
                }
                res.status(201).json({
                    message: "Booking successful",
                    booking,
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    res.status(500).json({
                        message: "An error occurred during booking",
                        error: err.message,
                    });
                }
                else {
                    res.status(500).json({ message: "An unexpected error occurred" });
                }
            }
        });
        this.getAllTickets = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const { userId } = req.params;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized access" });
                    return;
                }
                const tickets = await this.bookingService.getAllTicketsService(userId);
                if (!tickets || tickets.length === 0) {
                    res.status(404).json({ message: "No tickets found for this user" });
                    return;
                }
                const ticketsWithMovieDetails = await Promise.all(tickets.map(async (ticket) => {
                    const movie = await MoviesModel_1.Movie.findById(ticket.movieId).exec();
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
        this.cancelTicket = (0, express_async_handler_1.default)(async (req, res) => {
            const { bookingId } = req.params;
            const userId = req.user?._id;
            if (!bookingId || !userId) {
                res
                    .status(400)
                    .json({ message: "Booking ID and User ID are required" });
                return;
            }
            try {
                const cancellationResult = await this.bookingService.cancelTicketService(bookingId, userId);
                res.status(200).json({
                    success: true,
                    message: "Booking canceled successfully",
                    booking: cancellationResult,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to cancel booking",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
        this.getBookingDetails = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const { bookingId } = req.params;
                const booking = await this.bookingService.getBookingDetails(bookingId);
                if (booking) {
                    res.status(200).json(booking);
                }
                else {
                    res.status(404).json({ message: "Booking not found" });
                }
            }
            catch (error) {
                console.error("Error fetching Booking details:", error.message);
                res.status(500).json({ message: "Failed to fetch Booking details" });
            }
        });
        this.getTicketDetails = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const { ticketId } = req.params;
                const ticket = await this.bookingService.getTicketDetails(ticketId);
                if (ticket) {
                    res.status(200).json(ticket);
                }
                else {
                    res.status(404).json({ message: "Ticket not found" });
                }
            }
            catch (error) {
                console.error("Error fetching ticket details:", error.message);
                res.status(500).json({ message: "Failed to fetch ticket details" });
            }
        });
        this.updateBookingStatus = (0, express_async_handler_1.default)(async (req, res) => {
            const { bookingId } = req.params;
            const { status } = req.body;
            if (!status) {
                res.status(400).json({ message: "Status is required" });
                return;
            }
            try {
                const validStatuses = ["Pending", "Confirmed", "Cancelled"];
                if (!validStatuses.includes(status)) {
                    res.status(400).json({ message: "Invalid status" });
                    return;
                }
                const updatedBooking = await this.bookingService.updateBookingStatusService(bookingId, status);
                if (!updatedBooking) {
                    res.status(404).json({ message: "Booking not found" });
                    return;
                }
                res.status(200).json({
                    message: "Booking status updated successfully",
                    booking: updatedBooking,
                });
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to update booking status",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
        this.updateTicket = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const { ticketId } = req.params;
                const updatedData = req.body;
                const updatedTicket = await this.bookingService.updateTicket(ticketId, updatedData);
                if (updatedTicket) {
                    res
                        .status(200)
                        .json({ message: "Ticket updated successfully", updatedTicket });
                }
                else {
                    res.status(404).json({ message: "Ticket not found" });
                }
            }
            catch (error) {
                console.error("Error updating ticket:", error.message);
                res.status(500).json({ message: "Failed to update ticket" });
            }
        });
        this.getUserBookings = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const { userId } = req.params;
                const bookings = await this.bookingService.getUserBookings(userId);
                res.status(200).json(bookings);
            }
            catch (error) {
                console.error("Error fetching user bookings:", error.message);
                res.status(500).json({ message: "Failed to fetch user bookings" });
            }
        });
        this.getTheaterBookings = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const { theaterId } = req.params;
                const bookings = await this.bookingService.getTheaterBookings(theaterId);
                res.status(200).json(bookings);
            }
            catch (error) {
                console.error("Error fetching theater bookings:", error.message);
                res.status(500).json({ message: "Failed to fetch theater bookings" });
            }
        });
    }
};
exports.BookingController = BookingController;
exports.BookingController = BookingController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IBookingService")),
    __param(1, (0, inversify_1.inject)("INotificationService")),
    __param(2, (0, inversify_1.inject)("IWalletService")),
    __metadata("design:paramtypes", [Object, Object, Object])
], BookingController);
//# sourceMappingURL=BookingController.js.map