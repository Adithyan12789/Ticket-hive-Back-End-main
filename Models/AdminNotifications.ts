import mongoose, { Schema, model, Document } from "mongoose";

export interface IAdminNotification extends Document {
  adminId: mongoose.Types.ObjectId;
  isRead: boolean;
  message: string;
}

const adminNotificationSchema = new Schema<IAdminNotification>(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
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

export const AdminNotification = model<IAdminNotification>("AdminNotification", adminNotificationSchema);
