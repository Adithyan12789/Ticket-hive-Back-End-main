import { IOffer } from "../../Models/OffersModel";
import { OfferData } from "../../types/offerTypes";

export interface IOfferRepository {
  createOffer(offerData: OfferData): Promise<IOffer>;
  updateOffer(offerId: string, updates: Partial<OfferData>): Promise<IOffer | null>;
  deleteOffer(offerId: string): Promise<IOffer | null>;
  deleteExpiredOffers(currentDate: Date): Promise<void>;
  getAllOffers(): Promise<IOffer[]>;
}
