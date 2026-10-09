import mongoose, { Schema, model, Document } from "mongoose";

export interface ITheaterOwnerNotification extends Document {
  theaterOwnerId: mongoose.Types.ObjectId;
  isRead: boolean;
  message: string;
}

const TheaterOwnerNotificationSchema = new Schema<ITheaterOwnerNotification>(
  {
    theaterOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TheaterOwner',
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false, // Defaults to false if not specified
    },
    message: {
      type: String,
      required: true, // Message is required for the notification
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export const TheaterOwnerNotification = model<ITheaterOwnerNotification>("TheaterOwnerNotification", TheaterOwnerNotificationSchema);
