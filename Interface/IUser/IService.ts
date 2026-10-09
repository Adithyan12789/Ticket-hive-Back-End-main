// config / IService.ts

import { IOffer } from "../../Models/OffersModel";
import { IUser } from "../../Models/UserModel";

export interface IUserService {
  refreshToken(refreshToken: string): Promise<any | null>;
  authenticateUser(email: string, password: string): Promise<IUser>;
  handleGoogleLogin(name: string, email: string): Promise<any>;
  registerUserService(name: string,email: string,password: string,phone: string): Promise<IUser>;
  verifyOtpService(email: string, otp: string): Promise<any>;
  resendOtpService(email: string): Promise<any>;
  forgotPasswordService(email: string): Promise<any>;
  resetPasswordService(resetToken: string, password: string): Promise<any>;
  updateLocation(id: string,city: string,latitude: number,longitude: number): Promise<any>;
  getUserProfile(id: string): Promise<any>;
  updateUserProfileService(id: string,updateData: Partial<IUser>,fileData: { filename?: string }): Promise<IUser>;
  getOffersByTheaterIdService(theaterId: string): Promise<any>;
  logoutUserService(): Promise<void>;
}
