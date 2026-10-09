import { Types } from "mongoose";

export interface OfferData {
  paymentMethod: string;
  offerName: string;
  description: string;
  discountValue?: number;
  minPurchaseAmount?: number;
  applicableTheaters?: Types.ObjectId[] | string[];
  validityStart: Date | string;
  validityEnd: Date | string;
  createdBy: Types.ObjectId | string;
}
