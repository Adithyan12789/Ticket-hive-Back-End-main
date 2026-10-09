import { Booking } from "../Models/bookingModel";
import { Offer } from "../Models/OffersModel";
import User, { IUser } from "../Models/UserModel";
import { injectable } from "inversify";
import { BaseRepository } from "./Base/BaseRepository";
import { IUserRepository } from "../Interface/IUser/IRepository";

@injectable()
export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository {
  private readonly userModel = User;

  constructor() {
    super(User);
  }

  public async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  public async saveUser(userData: IUser): Promise<IUser> {
    if (typeof userData.save === "function") {
      return await userData.save();
    }
    const user = new User(userData);
    return await user.save();
  }

  public async updateLocation(
    userId: string,
    city: string,
    latitude: number,
    longitude: number
  ): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { city, latitude, longitude },
        { new: true }
      );
    } catch (error) {
      throw new Error("Error updating location");
    }
  }

  public async updateUserOtp(email: string, otp: string): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { email },
      {
        otp,
        otpVerified: false,
        otpGeneratedAt: new Date(),
        otpExpires: new Date(Date.now() + 5 * 60 * 1000),
      },
      { new: true }
    );

    if (!user) {
      throw new Error("Failed to update OTP for user");
    }

    return user;
  }

  public async updateUserOtpAndPassword(
    email: string,
    otp: string,
    hashedPassword: string
  ): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { email },
      {
        otp,
        password: hashedPassword,
        otpVerified: false,
        otpGeneratedAt: new Date(),
        otpExpires: new Date(Date.now() + 5 * 60 * 1000),
      },
      { new: true }
    );

    if (!user) {
      throw new Error("Failed to update OTP and password for user");
    }

    return user;
  }

  public async findUserByResetToken(resetToken: string): Promise<IUser | null> {
    return await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
  }

  public async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  public async updateUser(
    userId: string,
    updates: Partial<IUser>
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(userId, updates, { new: true });
  }

  public async findUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  public async findBookingsByUserId(userId: string): Promise<any[]> {
    return await Booking.find({ user: userId })
      .populate("movie theater screen")
      .lean();
  }

  public async findBookingById(bookingId: string): Promise<any | null> {
    return await Booking.findById(bookingId).populate("movie theater screen");
  }

  public async deleteBookingById(bookingId: string): Promise<any | null> {
    return await Booking.findByIdAndDelete(bookingId);
  }

  public async getOffersByTheaterId(theaterId: string) {
    return await Offer.find({ applicableTheaters: theaterId })
      .populate("applicableTheaters", "name location")
      .populate("createdBy", "name email ")
      .exec();
  }
}

export default new UserRepository();
