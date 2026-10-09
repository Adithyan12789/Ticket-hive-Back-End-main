import mongoose from "mongoose";

export interface theaterType {
  theaterOwnerId?: mongoose.Types.ObjectId;
  name?: string;
  description?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone?: string;
  images?: string[];
  amenities?: string[];
  isListed?: boolean;
  isVerified?: boolean;
  verificationStatus?: 'pending' | 'accepted' | 'rejected';
  latitude?: number;
  longitude?: number;
  showTimes?: string[];
  ticketPrice?: number;
  movies?: string[];
  certificate?: string;
  removeImages?: string[];
}

export interface tokenType {
  token: string;
  refreshToken?: string;
}

