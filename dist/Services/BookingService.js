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
exports.BookingService = void 0;
exports.getMovieTitleById = getMovieTitleById;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const MoviesModel_1 = require("../Models/MoviesModel");
const ScheduleModel_1 = require("../Models/ScheduleModel");
const inversify_1 = require("inversify");
async function getMovieTitleById(movieId) {
    const movie = await MoviesModel_1.Movie.findById(movieId);
    if (!movie) {
        throw new Error("Movie not found.");
    }
    return movie.title;
}
let BookingService = class BookingService {
    constructor(bookingRepository, movieRepository, walletRepository) {
        this.bookingRepository = bookingRepository;
        this.movieRepository = movieRepository;
        this.walletRepository = walletRepository;
        this.updateBookingStatusService = async (bookingId, status) => {
            try {
                const updatedBooking = await this.bookingRepository.updateBookingStatus(bookingId, status);
                return updatedBooking;
            }
            catch (error) {
                throw new Error("Error updating booking status");
            }
        };
    }
    async createBookingService(movieId, scheduleId, theaterId, screenId, seatIds, userId, offerId, totalPrice, showTime, paymentStatus, paymentMethod, convenienceFee, formattedBookingDate) {
        const formattedDateOnly = formattedBookingDate.split("T")[0];
        const startOfDay = new Date(formattedDateOnly + "T00:00:00.000Z");
        const endOfDay = new Date(formattedDateOnly + "T23:59:59.999Z");
        let schedule = await ScheduleModel_1.Schedule.findOne({
            screen: screenId,
            date: { $gte: startOfDay, $lte: endOfDay },
            "showTimes.time": showTime,
        });
        if (!schedule) {
            const existingSchedule = await ScheduleModel_1.Schedule.findOne({ screen: screenId });
            if (!existingSchedule) {
                throw new Error("No existing schedule found for the screen to use its layout.");
            }
            const layoutToUse = existingSchedule.showTimes[0].layout;
            const newLayout = layoutToUse.map((row) => row.map((seat) => ({
                ...seat,
                isAvailable: true,
            })));
            schedule = new ScheduleModel_1.Schedule({
                screen: screenId,
                date: formattedBookingDate,
                showTimes: [
                    {
                        time: showTime,
                        movie: movieId,
                        movieTitle: await getMovieTitleById(movieId),
                        layout: newLayout,
                    },
                ],
            });
            await schedule.save();
        }
        const targetShowTime = schedule.showTimes.find((show) => show.time === showTime);
        if (!targetShowTime) {
            throw new Error("Show time not found in the schedule.");
        }
        targetShowTime.layout = targetShowTime.layout.map((row) => row.map((seat) => seatIds.includes(seat.label) ? { ...seat, isAvailable: false } : seat));
        await schedule.save();
        try {
            console.log("🎫 Creating new booking...");
            console.log("User ID:", userId);
            console.log("Movie ID:", movieId);
            console.log("Theater ID:", theaterId);
            console.log("Screen ID:", screenId);
            console.log("Seats:", seatIds);
            console.log("Show Time:", showTime);
            console.log("Booking Date:", schedule.date);
            console.log("Payment Status:", paymentStatus);
            console.log("Payment Method:", paymentMethod);
            console.log("Total Price:", totalPrice);
            console.log("Convenience Fee:", convenienceFee);
            console.log("Offer ID:", offerId);
            const newBooking = await this.bookingRepository.createBooking({
                movie: new mongoose_1.default.Types.ObjectId(movieId),
                theater: new mongoose_1.default.Types.ObjectId(theaterId),
                screen: new mongoose_1.default.Types.ObjectId(screenId),
                offer: offerId ? new mongoose_1.default.Types.ObjectId(offerId) : null,
                seats: seatIds,
                bookingDate: schedule.date,
                showTime,
                paymentStatus: paymentStatus,
                paymentMethod: paymentMethod || "default",
                convenienceFee,
                user: new mongoose_1.default.Types.ObjectId(userId),
                totalPrice,
            });
            console.log("✅ Booking created successfully with ID:", newBooking._id);
            return newBooking;
        }
        catch (error) {
            console.error("❌ Failed to create booking:", error);
            console.error("Error details:", {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw new Error(`Booking creation failed: ${error.message}`);
        }
    }
    async getAllTicketsService(userId) {
        const bookings = await this.bookingRepository.findAllBookings(userId);
        if (!bookings.length)
            throw new Error("No tickets found");
        return bookings.map((booking) => ({
            bookingId: booking._id,
            userId: booking.user._id,
            userName: booking.user.name,
            userEmail: booking.user.email,
            screenId: booking.screen._id,
            movieId: booking.movie._id,
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
    async cancelTicketService(bookingId, userId) {
        const booking = await this.bookingRepository.findBookingById(bookingId);
        if (!booking)
            throw new Error("Booking not found");
        if (String(booking.user) !== userId) {
            throw new Error("You are not authorized to cancel this ticket");
        }
        const { seats, showTime, totalPrice, bookingDate, screen, movie } = booking;
        const movieDetails = await this.movieRepository.findMovieById(movie.toString());
        if (!movieDetails)
            throw new Error("Movie details not found");
        const schedule = await ScheduleModel_1.Schedule.findOne({
            screen: screen._id,
            date: bookingDate,
        });
        if (!schedule)
            throw new Error("Schedule not found for the specified screen and date.");
        const targetShowTime = schedule.showTimes.find((s) => s.time === showTime);
        if (!targetShowTime)
            throw new Error("Show time not found in the schedule.");
        let seatFound = false;
        targetShowTime.layout = targetShowTime.layout.map((row) => row.map((seat) => {
            if (seats.includes(seat.label)) {
                seatFound = true;
                return { ...seat, isAvailable: true };
            }
            return seat;
        }));
        if (!seatFound) {
            throw new Error("Seats not found in the layout for the specified show time.");
        }
        await schedule.save();
        booking.paymentStatus = "cancelled";
        await booking.save();
        const wallet = await this.walletRepository.findWalletByUserId(userId);
        if (!wallet)
            throw new Error("Wallet not found");
        const transaction = {
            transactionId: (0, uuid_1.v4)(),
            amount: totalPrice,
            type: "credit",
            status: "success",
            date: new Date(),
            description: `Refund: "${movieDetails.title}" on ${bookingDate.toLocaleDateString()}, ${showTime}, Screen ${screen.screenNumber}, Seats: ${seats.join(", ")}`,
        };
        wallet.transactions.push(transaction);
        wallet.balance += totalPrice;
        await wallet.save();
        return { message: "Booking canceled successfully", booking };
    }
    async getTicketDetails(ticketId) {
        const ticket = await this.bookingRepository.findTicketById(ticketId);
        if (!ticket)
            throw new Error("Ticket not found");
        return ticket;
    }
    async getBookingDetails(bookingId) {
        const booking = await this.bookingRepository.findBookingById(bookingId);
        if (!booking)
            throw new Error("Booking not found");
        return booking;
    }
    async updateTicket(ticketId, updatedData) {
        const updatedTicket = await this.bookingRepository.updateBooking(ticketId, updatedData);
        if (!updatedTicket)
            throw new Error("Failed to update ticket");
        return updatedTicket;
    }
    async getUserBookings(userId) {
        try {
            return await this.bookingRepository.getUserBookings(userId);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error in service while fetching user bookings: ${error.message}`);
            }
            else {
                throw new Error("An unknown error occurred while fetching user bookings.");
            }
        }
    }
    async getTheaterBookings(theaterId) {
        return await this.bookingRepository.getTheaterBookings(theaterId);
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IBookingRepository")),
    __param(1, (0, inversify_1.inject)("IMovieRepository")),
    __param(2, (0, inversify_1.inject)("IWalletRepository")),
    __metadata("design:paramtypes", [Object, Object, Object])
], BookingService);
//# sourceMappingURL=BookingService.js.map