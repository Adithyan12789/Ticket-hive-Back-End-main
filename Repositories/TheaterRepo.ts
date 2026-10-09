import { Movie } from "../Models/MoviesModel";
import { IOffer, Offer } from "../Models/OffersModel";
import TheaterDetails, { ITheaterDetails } from "../Models/TheaterDetailsModel";
import TheaterOwner, { ITheaterOwner } from "../Models/TheaterOwnerModel";
import { injectable } from "inversify";
import { BaseRepository } from "./Base/BaseRepository";
import { ITheaterRepository } from "../Interface/ITheater/IRepository";

    @injectable()
    export class TheaterRepository extends BaseRepository<ITheaterOwner> implements ITheaterRepository {
      
    private readonly theaterOwnerModel = TheaterOwner;

    constructor() {
        super(TheaterOwner);
    }

    public async getAllTheaterOwners(): Promise<void>{
        try {
            await TheaterOwner.find({});  
        } catch (error) {
            throw new Error("Error fetching theater owners");
        }
    }  

    public async findTheaterOwnerById(theaterOwnerId: string): Promise<ITheaterOwner | null> {
        return await TheaterOwner.findById(theaterOwnerId);
    }
    
    public async findTheaterById(theaterId: string): Promise<ITheaterDetails | null> {
      return await TheaterDetails.findById(theaterId);
    }    

    public async findTheaterOwnerByEmail(email: string): Promise<ITheaterOwner | null> {
        return await TheaterOwner.findOne({ email });
    }

    public async saveTheaterOwner(theaterOwnerData: Partial<ITheaterOwner>): Promise<ITheaterOwner> {
        const theaterOwner = new TheaterOwner(theaterOwnerData);
        return await theaterOwner.save();
      }

    public async findTheaterOwnerByResetToken(resetToken: string): Promise<ITheaterOwner | null> {
        return await TheaterOwner.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });
    }

    public createTheater = async (theaterId: string, theaterData: Partial<ITheaterDetails>) => {
        const theater = new TheaterDetails({ ...theaterData, theaterId });
        return await theater.save();
    };

    public async updateOtpDetails(
        theaterOwnerId: string,
        otp: string
      ): Promise<void> {
        await TheaterOwner.findByIdAndUpdate(theaterOwnerId, {
          otp,
          otpVerified: false,
          otpGeneratedAt: new Date(),
        });
      }
    
      public async createTheaterOwner(theaterOwnerDetails: Partial<ITheaterOwner>): Promise<ITheaterOwner> {
        const theaterOwner = new TheaterOwner(theaterOwnerDetails);
        return theaterOwner.save();
      }

    public async getAllTheaters(): Promise<ITheaterDetails[]> {
        try {
            const theaters = await TheaterDetails.find({});
            return theaters;
        } catch (error) {
            throw new Error("Error fetching theater owners");
        }
    }    

    public async updateTheaterOwner(theaterOwnerId: string, updates: Partial<ITheaterOwner>): Promise<ITheaterOwner | null> {
        return await TheaterOwner.findByIdAndUpdate(theaterOwnerId, updates, { new: true });
    }

    public async findTheatersByMovieTitle(movieTitle: string): Promise<ITheaterDetails[]> {
        try {
            const movie = await Movie.findOne({ title: movieTitle }).exec();
            if (!movie) {
                throw new Error('Movie not found');
            }
    
            const theaters = await TheaterDetails.find({ movies: movie._id }).exec();
            return theaters;
        } catch (error) {
            throw new Error("Error fetching theater by movie name");
        }
    }

    public async updateOffer(
        offerId: string,
        updates: Partial<IOffer>
      ): Promise<IOffer | null> {
        try {
          const offer = await Offer.findByIdAndUpdate(offerId, updates, {
            new: true,
          });
          if (!offer) {
            throw { statusCode: 404, message: "Offer not found" };
          }
          return offer;
        } catch (error: any) {
          console.error("Error updating the offer:", error);
          throw { statusCode: 500, message: "Internal server error" };
        }
      }   
      
      public async deleteOneById(id: string): Promise<boolean> {
        const result = await TheaterDetails.findByIdAndDelete(id);
        return result !== null;
      }
      
}

export default new TheaterRepository();
