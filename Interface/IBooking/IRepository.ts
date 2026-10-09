// config / IRepository.ts

import { Booking, IBooking } from "../../Models/bookingModel";

export interface IBookingRepository {
    createBooking(data: Partial<IBooking>): Promise<IBooking>;
    findAllBookings(userId: string): Promise<any>;
    findTicketById(ticketId: string): Promise<IBooking>;
    findBookingById(bookingId: string): Promise<any>;
    updateBookingStatus(bookingId: string, status: string): Promise<IBooking | null>;
    updateBooking(ticketId: string, updatedData: Partial<typeof Booking>): Promise<IBooking | null>;
    getUserBookings(userId: string): Promise<IBooking[]>;
    getTheaterBookings(theaterId: string): Promise<IBooking[]>;
}
