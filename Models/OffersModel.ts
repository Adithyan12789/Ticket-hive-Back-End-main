import mongoose, { Schema, model, Document, Types } from "mongoose";


export interface IOffer extends Document {
  paymentMethod: string;
  offerName: string;
  description: string;
  discountValue?: number;
  minPurchaseAmount?: number;
  applicableTheaters?: Types.ObjectId[];
  validityStart: Date;
  validityEnd: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    paymentMethod: { type: String, required: true },
    offerName: { type: String, required: true },
    description: { type: String, required: true },
    discountValue: { type: Number, default: 0 },
    minPurchaseAmount: { type: Number, default: 0 },
    applicableTheaters: [{ type: mongoose.Schema.Types.ObjectId, ref: "TheaterDetails" }],
    validityStart: { type: Date, required: true },
    validityEnd: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "TheaterOwner", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Offer = model<IOffer>("Offer", OfferSchema);
