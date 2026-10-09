import { injectable } from "inversify";
import { IOfferRepository } from "../Interface/IOffer/IRepository";
import { IOffer, Offer } from "../Models/OffersModel";
import { OfferData } from "../types/offerTypes";
import { BaseRepository } from "./Base/BaseRepository";

@injectable()
export class OfferRepository
  extends BaseRepository<IOffer>
  implements IOfferRepository
{
  private readonly offerModel = Offer;

  constructor() {
    super(Offer);
  }

  public async createOffer(offerData: OfferData): Promise<IOffer> {
    const newOffer = new Offer(offerData);
    return newOffer.save();
  }

  public async updateOffer(
    offerId: string,
    updates: Partial<OfferData>
  ): Promise<IOffer | null> {
    const offer = await Offer.findByIdAndUpdate(offerId, updates, {
      new: true,
    });
    if (!offer) {
      throw { statusCode: 404, message: "Offer not found" };
    }
    return offer;
  }

  public async deleteOffer(offerId: string): Promise<IOffer | null> {
    return Offer.findByIdAndDelete(offerId);
  }

  public async deleteExpiredOffers(currentDate: Date): Promise<void> {
    await Offer.deleteMany({ validityEnd: { $lt: currentDate } });
  }

  public async getAllOffers(): Promise<IOffer[]> {
    return Offer.find();
  }
}
