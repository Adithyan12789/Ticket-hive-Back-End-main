import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  user: Types.ObjectId;
  movie: Types.ObjectId;
  rating: number;
  comment: string;
  likedBy: Types.ObjectId[];
  dislikedBy: Types.ObjectId[];
  likes: number; // Virtual
  dislikes: number; // Virtual
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, required: false },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ReviewSchema.virtual('likes').get(function () {
  return this.likedBy ? this.likedBy.length : 0;
});

ReviewSchema.virtual('dislikes').get(function () {
  return this.dislikedBy ? this.dislikedBy.length : 0;
});

export const Review = model<IReview>("Review", ReviewSchema);
