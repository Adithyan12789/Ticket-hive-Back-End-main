import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IMovie extends Document {
  title: string;
  genres: string[];
  duration: string;
  description: string;
  languages: string[];
  images: string[];
  casts: string[];
  castsImages: string[];
  director: string;
  releaseDate: Date;
  posters: string | null;
  banners: string[];
  review?: Types.ObjectId;
  averageRating: number;
}

const MovieSchema = new Schema<IMovie>({
  title: { type: String, required: true },
  genres: { type: [String], required: true },
  duration: { type: String, required: true },
  description: { type: String, required: true },
  languages: { type: [String], required: true },
  images: { type: [String], required: true, default: [] },
  casts: { type: [String], required: true },
  castsImages: { type: [String], required: true, default: [] },
  director: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  posters: { type: String, required: true },
  banners: { type: [String], required: true },
  review: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
  averageRating: { type: Number, default: 0 },
});

MovieSchema.methods.calculateAverageRating = async function () {
  const reviews = await mongoose.model("Review").find({ movie: this._id });

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / reviews.length;
  } else {
    this.averageRating = 0;
  }

  await this.save();
};


export const Movie = model<IMovie>("Movie", MovieSchema);
