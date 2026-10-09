// config / IRepository.ts

import { ITheaterDetails } from "../../Models/TheaterDetailsModel";
import { ITheaterOwner } from "../../Models/TheaterOwnerModel";

export interface ITheaterRepository {
    findTheaterOwnerByEmail(email: string): Promise<ITheaterOwner | null>;
    saveTheaterOwner(theaterOwnerData: Partial<ITheaterOwner>): Promise<ITheaterOwner>;
    updateOtpDetails(theaterOwnerId: string, otp: string): Promise<void>;
    createTheaterOwner(theaterOwnerDetails: Partial<ITheaterOwner>): Promise<ITheaterOwner>;
    getAllTheaterOwners(): Promise<void>;
    findTheaterOwnerByResetToken(resetToken: string): Promise<any>;
    findTheaterOwnerById(theaterOwnerId: string): Promise<any>;
    findTheaterById(theaterId: string): Promise<ITheaterDetails | null>
    createTheater(theaterId: string, theaterData: any): Promise<ITheaterDetails | null>
    getAllTheaters(): Promise<ITheaterDetails[]>
    deleteOneById(id: string): Promise<boolean>;
    updateTheaterOwner(theaterOwnerId: string, updates: Partial<ITheaterOwner>): Promise<ITheaterOwner | null>;
}  
