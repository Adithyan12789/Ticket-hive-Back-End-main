import mongoose, { Schema, Document, model } from "mongoose";

export interface ICast extends Document {
    name: string;
    role: "Actor" | "Director";
    image: string;
}

const CastSchema = new Schema<ICast>({
    name: { type: String, required: true },
    role: { type: String, enum: ["Actor", "Director"], required: true },
    image: { type: String, required: true },
}, { timestamps: true });

export const Cast = mongoose.models.Cast || model<ICast>("Cast", CastSchema);
