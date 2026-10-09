// config / IService.ts

import { ITheaterOwner } from "../../Models/TheaterOwnerModel";
import { IUser } from "../../Models/UserModel";
import { AdminLogin } from "../../types/adminTypes";

export interface IAdminService {
  adminLoginService(email: string, password: string, res: any): Promise<AdminLogin>;
  getAllUsers(): Promise<IUser[]>;
  getAllTheaterOwners(): Promise<ITheaterOwner[]>;
  blockUser(userId: string): Promise<any | null>;
  unblockUser(userId: string): Promise<any | null>;
  blockTheaterOwner(theaterOwnerId: string): Promise<any | null>;
  unblockTheaterOwner(theaterOwnerId: string): Promise<any | null>;
  getVerificationDetails(): Promise<any[]>;
  acceptVerification(theaterId: string): Promise<{ message: string }>;
  rejectVerification(theaterId: string, reason: string): Promise<{ message: string }>;
  getAllTicketsService(): Promise<any>;
  getAllAdmins(): Promise<AdminLogin[]>;
  adminLogoutService(res: any): Promise<{ message: string }>;
}
