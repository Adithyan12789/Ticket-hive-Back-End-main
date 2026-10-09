import bcrypt from "bcryptjs";
import crypto from "crypto";
import UserRepository from "../Repositories/UserRepo";
import EmailUtil from "../Utils/EmailUtil";
import User, { IUser } from "../Models/UserModel";
import { Booking } from "../Models/bookingModel";
import { Movie } from "../Models/MoviesModel";
import TheaterDetails from "../Models/TheaterDetailsModel";
import { inject, injectable } from "inversify";
import { IUserRepository } from "../Interface/IUser/IRepository";
import TokenService from "../Utils/GenerateToken";

@injectable()
export class UserService {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository
  ) { }


  public async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Verify the refresh token
    const decoded = TokenService.verifyRefreshToken(refreshToken);

    if (!decoded || typeof decoded === "string") {
      throw new Error("Invalid or expired refresh token");
    }

    // Retrieve the user
    const user = await this.userRepository.findUserById(decoded.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Generate a new access token
    const newAccessToken = TokenService.generateAccessToken(user._id.toString());

    return { accessToken: newAccessToken };
  }

  public async authenticateUser(email: string, password: string) {
    const user = await this.userRepository.findUserByEmail(email);

    console.log("[authenticateUser] Found user:", user ? user.email : "not found");

    if (!user) {
      throw new Error("Invalid Email or Password");
    }

    if (user.isBlocked) {
      throw new Error("Your account is blocked");
    }

    // Prevent login for users who registered but haven't verified their OTP
    if (user.otpVerified === false) {
      throw new Error("Email not verified. Please verify your OTP first.");
    }

    const passwordMatch = await user.matchPassword(password);
    console.log("[authenticateUser] Password match:", passwordMatch);

    if (passwordMatch) {
      return user;
    }

    throw new Error("Invalid Email or Password");
  }

  public async handleGoogleLogin(name: string, email: string): Promise<IUser & { isNew?: boolean }> {
    let user = await this.userRepository.findUserByEmail(email);

    if (user) {
      return user;
    }

    user = await this.userRepository.createUser({
      name,
      email,
      otp: "",
      phone: "",
      password: "",
    });

    if (!user) {
      throw new Error("Invalid user data");
    }

    user.isNew = true;
    return user;
  }


  public async registerUserService(
    name: string,
    email: string,
    password: string,
    phone: string
  ): Promise<IUser> {
    const existingUser = await this.userRepository.findUserByEmail(email);

    if (existingUser) {
      if (!existingUser.otpVerified) {
        // Re-registration: update OTP AND the new password so login works
        // after verification with whatever password the user entered this time.
        const otp = crypto.randomInt(100000, 999999).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updatedUser = await this.userRepository.updateUserOtpAndPassword(
          email,
          otp,
          hashedPassword
        );

        console.log("Re-registration: updated OTP and password for unverified user");
        await EmailUtil.sendOtpEmail(email, otp);
        return updatedUser;
      }

      throw new Error("Email already exists.");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await this.userRepository.createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpVerified: false,
      otpGeneratedAt: new Date(),
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
    });

    await EmailUtil.sendOtpEmail(email, otp);
    return newUser;
  }


  public async verifyOtpService(email: string, otp: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    console.log(`Verifying OTP: Submitted: ${otp}, Stored: ${user.otp}`);
    console.log(`User Timestamps: otpExpires: ${user.otpExpires}, otpGeneratedAt: ${user.otpGeneratedAt}`);

    const currentTime = new Date().getTime();

    // Check if otpExpires exists (priority check)
    if (user.otpExpires) {
      if (currentTime > new Date(user.otpExpires).getTime()) {
        throw new Error("OTP expired");
      }
    } else {
      // Fallback logic for when otpExpires is not set (legacy/initial reg)
      if (!user.otpGeneratedAt) {
        // If in dev or legacy, we might skip expiration if generation time is missing but OTP matches.
        // For now, let's allow it if we found a user and the OTP matches later.
        // OR force a "missing generation time" error.
        // Given the user is having issues, let's log and proceed or set a default.
        console.log("Warning: otpGeneratedAt is missing for fallback check.");
      } else {
        const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
        const otpGeneratedAt = new Date(user.otpGeneratedAt).getTime();
        if (currentTime - otpGeneratedAt > OTP_EXPIRATION_TIME) {
          throw new Error("OTP expired");
        }
      }
    }

    if (String(user.otp) === String(otp)) {
      user.otpVerified = true;
      await user.save();
      return true;
    }
    throw new Error("Incorrect OTP");
  }

  public async resendOtpService(email: string) {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const updatedUser = await this.userRepository.updateUserOtp(email, otp);
    await EmailUtil.sendOtpEmail(updatedUser.email, otp);
    return updatedUser;
  }

  public async forgotPasswordService(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    return resetToken;
  }

  public async resetPasswordService(resetToken: string, password: string) {
    const user = await this.userRepository.findUserByResetToken(resetToken);
    if (!user) {
      throw new Error("Invalid or expired token");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return true;
  }

  public async updateLocation(
    userId: string,
    city: string,
    latitude: number,
    longitude: number
  ): Promise<IUser | null> {
    try {
      // Call the repository method to update the location
      return await this.userRepository.updateLocation(userId, city, latitude, longitude);
    } catch (error) {
      throw new Error("Service: Error updating location");
    }
  }

  public getUserProfile = async (userId: any) => {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      profileImageName: user.profileImageName,
    };
  };

  public updateUserProfileService = async (
    userId: string,
    updateData: {
      currentPassword?: string;
      name: string;
      phone: string;
      password?: string;
    },
    profileImage: { filename: string | undefined }
  ) => {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Only check current password if user is updating their password
    if (updateData.password && updateData.currentPassword) {
      const isMatch = await user.matchPassword(updateData.currentPassword);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }
    }

    user.name = updateData.name || user.name;
    user.phone = updateData.phone || user.phone;

    // If a new password is provided, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateData.password, salt);
    }

    // If a new profile image is uploaded, update the image filename
    if (profileImage) {
      user.profileImageName = profileImage.filename || user.profileImageName;
    }

    return await this.userRepository.saveUser(user);
  };


  public getOffersByTheaterIdService = async (theaterId: string) => {
    try {
      return await this.userRepository.getOffersByTheaterId(theaterId);
    } catch (error) {
      throw new Error("Error fetching Offers");
    }
  };

  public async logoutUserService(): Promise<any> {
    return true;
  }
}