// config / IService.ts

import { ITheaterDetails } from "../../Models/TheaterDetailsModel";
import { ITheaterOwner } from "../../Models/TheaterOwnerModel";
import { theaterType, tokenType } from "../../types/theaterOwnerTypes";

export interface ITheaterService {
    logoutTheaterOwnerService(): Promise<void>;
    authTheaterOwnerService(email: string, password: string): Promise<ITheaterOwner>;
    googleLoginTheaterOwnerService(name: string, email: string): Promise<ITheaterOwner>;
    registerTheaterOwnerService(name: string, email: string, password: string, phone: string): Promise<ITheaterOwner>;
    getAllTheaterOwners(): Promise<void>;
    verifyTheaterOwnerOtpService(email: string, otp: string): Promise<any>
    resendTheaterOwnerOtpService(email: string): Promise<ITheaterOwner>;
    forgotTheaterOwnerPasswordService(email: string): Promise<string>;
    resetTheaterOwnerPasswordService(resetToken: string, password: string): Promise<any>;


    getTheaterOwnerProfile(id: string): Promise<ITheaterOwner>;
    updateTheaterOwnerProfileService(id :string, updateData: any, fileData: any): Promise<any>;
    uploadCertificates(theaterId: string, certificatePath: string): Promise<ITheaterDetails | null>;
    addTheaterService(theaterId: string, {}: theaterType): Promise<any>;
    getAllTheaters(): Promise<ITheaterDetails[]>;
    getTheaterById(theaterId: string): Promise<ITheaterDetails | null>;
    updateTheaterData(id: string, updateData: any, files: any): Promise<ITheaterDetails | null>;
    deleteTheaterService(id: string): Promise<boolean>;
    
  }
