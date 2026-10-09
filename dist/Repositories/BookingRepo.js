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
exports.BookingRepository = void 0;
const bookingModel_1 = require("../Models/bookingModel");
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const inversify_1 = require("inversify");
const BaseRepository_1 = require("./Base/BaseRepository");
const mongoose_1 = __importDefault(require("mongoose"));
let BookingRepository = class BookingRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(bookingModel_1.Booking);
        this.bookModel = bookingModel_1.Booking;
    }
    async findAllBookings(userId) {
        return await bookingModel_1.Booking.find({ "user": userId })
            .populate("user", "name email")
            .populate("movie theater screen")
            .lean();
    }
    async findUserById(userId) {
        return await UserModel_1.default.findById(userId);
    }
    async findBookingsByUserId(userId) {
        return await bookingModel_1.Booking.find({ user: userId }).populate("movie theater screen").lean();
    }
    async findTicketById(ticketId) {
        return await bookingModel_1.Booking.findById(ticketId).populate("movie theater screen");
    }
    async findBookingById(bookingId) {
        return await bookingModel_1.Booking.findById(bookingId).populate("movie theater screen");
    }
    async deleteBookingById(bookingId) {
        return await bookingModel_1.Booking.findByIdAndDelete(bookingId);
    }
    async createBooking(data) {
        try {
            if (mongoose_1.default.connection.readyState !== 1) {
                console.error("❌ Database not connected. Connection state:", mongoose_1.default.connection.readyState);
                throw new Error("Database connection is not ready");
            }
            console.log("📝 Creating booking with data:", JSON.stringify(data, null, 2));
            const newBooking = await bookingModel_1.Booking.create(data);
            console.log("✅ Booking created successfully:", newBooking._id);
            console.log("📊 Booking details:", JSON.stringify(newBooking, null, 2));
            return newBooking;
        }
        catch (error) {
            console.error("❌ Error creating booking:", error);
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            if (error.errors) {
                console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
            }
            throw new Error(`Failed to create booking: ${error.message}`);
        }
    }
    async updateBookingStatus(bookingId, status) {
        try {
            const updatedBooking = await bookingModel_1.Booking.findOneAndUpdate({ _id: bookingId }, { paymentStatus: status }, { new: true }).exec();
            return updatedBooking;
        }
        catch (error) {
            console.error("Error updating booking status:", error.message);
            throw new Error("Error updating booking status");
        }
    }
    async updateBooking(bookingId, updatedData) {
        return await bookingModel_1.Booking.findByIdAndUpdate(bookingId, updatedData, { new: true });
    }
    async getUserBookings(userId) {
        return await this.findBookingsByUserId(userId);
    }
    async getTheaterBookings(theaterId) {
        return await bookingModel_1.Booking.find({ theater: theaterId })
            .populate("user", "name email")
            .populate("movie", "title")
            .populate("screen", "screenName");
    }
};
exports.BookingRepository = BookingRepository;
exports.BookingRepository = BookingRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], BookingRepository);
exports.default = new BookingRepository();
//# sourceMappingURL=BookingRepo.js.map