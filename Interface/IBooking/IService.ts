// config / IService.ts

import { Booking, IBooking } from "../../Models/bookingModel";
import { BookingDetails } from "../../Services/BookingService";

export interface IBookingService {
  createBookingService(
    movieId: string,
    scheduleId: string,
    theaterId: string,
    screenId: string,
    seatIds: string[],
    userId: string,
    offerId: string,
    totalPrice: number,
    showTime: string,
    paymentStatus: "pending" | "completed" | "failed",
    paymentMethod: "card" | "cash" | "UPI" | "wallet",
    convenienceFee: number,
    formattedNextDay?: string
  ): Promise<IBooking>;

  getAllTicketsService(userId: string): Promise<any[]>;
  getTicketDetails(ticketId: string): Promise<IBooking>;
  cancelTicketService(bookingId: string, userId: string): Promise<{ message: string; booking: IBooking; }>;
  getBookingDetails(bookingId: string): Promise<string>;
  updateBookingStatusService(bookingId: string, status: string): Promise<IBooking | null>;
  updateTicket(ticketId: string, updatedData: Partial<typeof Booking>): Promise<IBooking>;
  getUserBookings(userId: string): Promise<IBooking[]>;
  getTheaterBookings(theaterId: string): Promise<IBooking[]>;
}
