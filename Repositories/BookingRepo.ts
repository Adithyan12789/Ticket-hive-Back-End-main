import { Booking, IBooking } from "../Models/bookingModel";
import User, { IUser } from "../Models/UserModel";
import { injectable } from "inversify";
import { BaseRepository } from "./Base/BaseRepository";
import { IBookingRepository } from "../Interface/IBooking/IRepository";
import mongoose from "mongoose";

@injectable()
export class BookingRepository
  extends BaseRepository<IBooking>
  implements IBookingRepository {
  private readonly bookModel = Booking;

  constructor() {
    super(Booking);
  }

  public async findAllBookings(userId: string): Promise<any[]> {
    return await Booking.find({ "user": userId })
      .populate("user", "name email")
      .populate("movie theater screen")
      .lean();
  }

  public async findUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  public async findBookingsByUserId(userId: string): Promise<any[]> {
    return await Booking.find({ user: userId }).populate("movie theater screen").lean();
  }

  public async findTicketById(ticketId: string): Promise<any | null> {
    return await Booking.findById(ticketId).populate("movie theater screen");
  }

  public async findBookingById(bookingId: string): Promise<any | null> {
    return await Booking.findById(bookingId).populate("movie theater screen");
  }

  public async deleteBookingById(bookingId: string): Promise<any | null> {
    return await Booking.findByIdAndDelete(bookingId);
  }

  public async createBooking(data: Partial<IBooking>) {
    try {
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        console.error("❌ Database not connected. Connection state:", mongoose.connection.readyState);
        throw new Error("Database connection is not ready");
      }

      console.log("📝 Creating booking with data:", JSON.stringify(data, null, 2));

      const newBooking = await Booking.create(data);

      console.log("✅ Booking created successfully:", newBooking._id);
      console.log("📊 Booking details:", JSON.stringify(newBooking, null, 2));

      return newBooking;
    } catch (error: any) {
      console.error("❌ Error creating booking:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);

      if (error.errors) {
        console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
      }

      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  public async updateBookingStatus(bookingId: string, status: string): Promise<IBooking | null> {
    try {
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: bookingId },
        { paymentStatus: status },
        { new: true }
      ).exec();

      return updatedBooking;
    } catch (error: any) {
      console.error("Error updating booking status:", error.message);
      throw new Error("Error updating booking status");
    }
  }

  public async updateBooking(bookingId: string, updatedData: Partial<typeof Booking>): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(bookingId, updatedData, { new: true });
  }

  public async getUserBookings(userId: string): Promise<IBooking[]> {
    return await this.findBookingsByUserId(userId);
  }

  public async getTheaterBookings(theaterId: string): Promise<IBooking[]> {
    return await Booking.find({ theater: theaterId })
      .populate("user", "name email")
      .populate("movie", "title")
      .populate("screen", "screenName");
  }
}

export default new BookingRepository();
