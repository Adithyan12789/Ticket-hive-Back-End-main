import { inject, injectable } from "inversify";
import { IOfferService } from "../Interface/IOffer/IService";
import { IOffer } from "../Models/OffersModel";
import { IOfferRepository } from "../Interface/IOffer/IRepository";
import { OfferData } from "../types/offerTypes";

@injectable()
export class OfferService implements IOfferService {
  constructor(
    @inject("IOfferRepository") private readonly offerRepository: IOfferRepository
  ) {}

  public async addOfferService(offerData: OfferData): Promise<IOffer> {

    console.log("Offer data before validation:", offerData);

    const { offerName, createdBy, paymentMethod, description, discountValue, minPurchaseAmount, validityStart, validityEnd, applicableTheaters } =
      offerData;

    if (
      !offerName ||
      !createdBy ||
      !paymentMethod ||
      !description ||
      !discountValue ||
      minPurchaseAmount === undefined ||
      !validityStart ||
      !validityEnd ||
      !Array.isArray(applicableTheaters) ||
      applicableTheaters.length === 0
    ) {
      throw { statusCode: 400, message: "All fields are required" };
    }

    const parsedValidityStart = new Date(validityStart);
    const parsedValidityEnd = new Date(validityEnd);

    if (
      isNaN(parsedValidityStart.getTime()) ||
      isNaN(parsedValidityEnd.getTime())
    ) {
      throw { statusCode: 400, message: "Invalid date format" };
    }

    const createdOffer = await this.offerRepository.createOffer({
      ...offerData,
      validityStart: parsedValidityStart,
      validityEnd: parsedValidityEnd,
    }); 

    return createdOffer;
  }

  public async updateOfferService(offerId: string, offerData: OfferData): Promise<IOffer | null> {
    return this.offerRepository.updateOffer(offerId, offerData);
  }

  public async deleteOfferService(offerId: string): Promise<IOffer | null> {
    return this.offerRepository.deleteOffer(offerId);
  }

  public async getOffersService(): Promise<IOffer[]> {
    const currentDate = new Date();
    await this.offerRepository.deleteExpiredOffers(currentDate);
    return this.offerRepository.getAllOffers();
  }
}
