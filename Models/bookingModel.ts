import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  movie: mongoose.Types.ObjectId;
  theater: mongoose.Types.ObjectId;
  screen: mongoose.Types.ObjectId; 
  offer?: mongoose.Types.ObjectId | null;
  seats: string[];
  showTime: string;
  totalPrice: number;
  paymentStatus: "pending" | "confirmed" | "cancelled" | "failed";
  paymentMethod: string;
  convenienceFee: number;
  bookingDate: Date;
}

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'TheaterDetails', required: true },
  screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screens', required: true },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null},
  seats: { type: [String], required: true },
  bookingDate: { type: Date, required: true },
  showTime: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  convenienceFee: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});


export const Booking = model<IBooking>("Booking", bookingSchema);
