// config / IRepository.ts

import { IUser } from "../../Models/UserModel";

export interface IUserRepository {
    findUserByEmail(email: string): Promise<IUser | null>;
    findUserById(userId: string): Promise<any | null>;
    createUser(userData: Partial<IUser>): Promise<IUser>;
    updateUserOtp(email: string, otp: string): Promise<IUser>;  
    updateUserOtpAndPassword(email: string, otp: string, hashedPassword: string): Promise<IUser>;
    saveUser(user: IUser): Promise<IUser>;  
    findUserByResetToken(resetToken: string): Promise<any>;  
    updateLocation(id: string, city: string, latitude: number, longitude: number): Promise<any>;  
    getOffersByTheaterId(theaterId: string): Promise<any>;  
}  
