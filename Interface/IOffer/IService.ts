import { IOffer } from "../../Models/OffersModel";
import { OfferData } from "../../types/offerTypes";

export interface IOfferService {
  addOfferService(offerData: OfferData): Promise<IOffer>;
  updateOfferService(offerId: string, offerData: OfferData): Promise<IOffer | null>;
  deleteOfferService(offerId: string): Promise<IOffer | null>;
  getOffersService(): Promise<IOffer[]>;
}
