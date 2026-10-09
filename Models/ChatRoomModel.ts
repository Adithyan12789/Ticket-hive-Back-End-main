import mongoose, { Schema, model, Document } from "mongoose";

export interface IChatRoom extends Document {
  adminId: mongoose.Types.ObjectId;
  theaterOwnerId: mongoose.Types.ObjectId;
}

const chatRoomSchema = new Schema<IChatRoom>(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    theaterOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TheaterOwner',
      required: true,
    },
  },
  { timestamps: true }
);

export const ChatRoom = model<IChatRoom>("ChatRoom", chatRoomSchema);
