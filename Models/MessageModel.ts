import mongoose, { Schema, model, Document } from "mongoose";

export interface IMessage extends Document {
  chatRoomId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderType: "TheaterOwner" | "Admin";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  read: boolean;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderType", // Dynamic ref based on senderType
    },
    senderType: {
      type: String,
      required: true,
      enum: ["Admin", "TheaterOwner"], // Restrict to User or Hotel
    },
    content: {
      type: String,
      required: false, // Optional, because fileUrl or fileName might be present
    },
    fileUrl: {
      type: String,
      required: false, // Optional
    },
    fileName: {
      type: String,
      required: false, // Optional
    },
    read: {
      type: Boolean,
      default: false, // Default value set to false
    },
  },
  { timestamps: true }
);

export const Message = model<IMessage>("Message", MessageSchema);
