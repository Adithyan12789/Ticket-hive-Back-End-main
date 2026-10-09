import bcrypt from "bcryptjs";
import crypto from "crypto";
import TheaterRepository from "../Repositories/TheaterRepo";
import EmailUtil from "../Utils/EmailUtil";
import TheaterOwner, { ITheaterOwner } from "../Models/TheaterOwnerModel";
import TheaterDetails, { ITheaterDetails } from "../Models/TheaterDetailsModel";
import { Movie } from "../Models/MoviesModel";
import mongoose from "mongoose";
import { IOffer, Offer } from "../Models/OffersModel";
import { inject, injectable } from "inversify";
import { ITheaterRepository } from "../Interface/ITheater/IRepository";

export interface OfferData {
  offerName: string;
  paymentMethod: string;
  offerDescription: string;
  discountValue: number;
  minPurchaseAmount: number;
  validityStart: string | Date;
  validityEnd: string | Date;
  applicableTheaters: string[];
}

export interface CustomRequest extends Request {
  user?: any;
}

@injectable()
export class TheaterService {
  constructor(
    @inject("ITheaterRepository") private theaterRepository: ITheaterRepository
  ) { }

  public async authTheaterOwnerService(email: string, password: string) {
    const theater = await this.theaterRepository.findTheaterOwnerByEmail(email);

    if (theater && (await theater.matchPassword(password))) {
      if (theater.isBlocked) {
        throw new Error("Your account has been blocked");
      }
      return theater;
    }

    throw new Error("Invalid Email or Password");
  }

  public async googleLoginTheaterOwnerService(name: string, email: string): Promise<ITheaterOwner> {
    let theaterOwner = await this.theaterRepository.findTheaterOwnerByEmail(email);

    if (theaterOwner) {
      return theaterOwner;
    } else {
      theaterOwner = await this.theaterRepository.saveTheaterOwner({
        name,
        email,
        otp: "",
        phone: "",
        password: "",
      });

      if (!theaterOwner) {
        throw new Error("Failed to create a new theater owner");
      }

      return theaterOwner;
    }
  }

  public async registerTheaterOwnerService(
    name: string,
    email: string,
    password: string,
    phone: string
  ) {
    const existingTheaterOwner =
      await this.theaterRepository.findTheaterOwnerByEmail(email);

    if (existingTheaterOwner) {
      if (!existingTheaterOwner.otpVerified) {
        const otp = crypto.randomInt(100000, 999999).toString();
        const id = existingTheaterOwner._id.toString();
        await this.theaterRepository.updateOtpDetails(
          id,
          otp
        );

        await EmailUtil.sendOtpEmail(existingTheaterOwner.email, otp);
        return existingTheaterOwner;
      }

      throw new Error("Email already exists.");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTheaterOwner = await this.theaterRepository.createTheaterOwner({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpVerified: false,
      otpGeneratedAt: new Date(),
      otpExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    await EmailUtil.sendOtpEmail(newTheaterOwner.email, otp);
    return newTheaterOwner;
  }

  public async verifyTheaterOwnerOtpService(email: string, otp: string) {
    const theater = await this.theaterRepository.findTheaterOwnerByEmail(email);
    if (!theater) {
      throw new Error("Theater owner not found");
    }

    const currentTime = new Date().getTime();

    // Check if otpExpires exists (priority check)
    if (theater.otpExpires) {
      if (currentTime > new Date(theater.otpExpires).getTime()) {
        throw new Error("OTP expired");
      }
    } else {
      // Fallback to otpGeneratedAt
      const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
      if (currentTime - new Date(theater.otpGeneratedAt).getTime() > OTP_EXPIRATION_TIME) {
        throw new Error("OTP expired");
      }
    }

    if (String(theater.otp) === String(otp)) {
      theater.otpVerified = true;
      await theater.save();
      return true;
    }
    throw new Error("Incorrect OTP");
  }

  public async resendTheaterOwnerOtpService(email: string) {
    const theater = await this.theaterRepository.findTheaterOwnerByEmail(email);

    if (!theater) {
      throw new Error("User not found");
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    theater.otp = otp;
    theater.otpGeneratedAt = new Date();
    theater.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Consistent 5 minutes

    try {
      await this.theaterRepository.updateTheaterOwner(theater._id.toString(), {
        otp: theater.otp,
        otpGeneratedAt: theater.otpGeneratedAt,
        otpExpires: theater.otpExpires,
      });
    } catch (err) {
      throw new Error("Failed to save user with new OTP");
    }

    try {
      await EmailUtil.sendOtpEmail(theater.email, otp);
    } catch (err: any) {
      throw new Error(`Failed to send OTP email: ${err.message} `);
    }

    return theater;
  }

  public async forgotTheaterOwnerPasswordService(email: string) {
    const theater = await this.theaterRepository.findTheaterOwnerByEmail(email);
    if (!theater) {
      throw new Error("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    theater.resetPasswordToken = resetToken;
    theater.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await theater.save();

    return resetToken;
  }

  public async resetTheaterOwnerPasswordService(
    resetToken: string,
    password: string
  ) {
    const theater = await this.theaterRepository.findTheaterOwnerByResetToken(
      resetToken
    );
    if (!theater) {
      throw new Error("Invalid or expired token");
    }

    const salt = await bcrypt.genSalt(10);
    theater.password = await bcrypt.hash(password, salt);
    theater.resetPasswordToken = undefined;
    theater.resetPasswordExpires = undefined;

    await theater.save();

    return true;
  }

  public async getAllTheaterOwners() {
    let theaterOwners = await this.theaterRepository.getAllTheaterOwners();
    return theaterOwners;
  }

  public async getTheaterOwnerProfile(theaterOwnerId: string): Promise<ITheaterOwner> {
    const theaterOwner = await this.theaterRepository.findTheaterOwnerById(
      theaterOwnerId
    );

    if (!theaterOwner) {
      throw new Error("theater Owner not found");
    }

    return theaterOwner
  };

  public updateTheaterOwnerProfileService = async (
    theaterOwnerId: string,
    updateData: {
      currentPassword: string;
      name: string;
      phone: string;
      password: string;
    },
    profileImage: { filename: string | undefined }
  ): Promise<any> => {
    const theaterOwner = await TheaterRepository.findTheaterOwnerById(
      theaterOwnerId
    );
    if (!theaterOwner) {
      throw new Error("theater Owner not found");
    }

    if (updateData.currentPassword) {
      const isMatch = await theaterOwner.matchPassword(
        updateData.currentPassword
      );
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }
    }

    theaterOwner.name = updateData.name || theaterOwner.name;
    theaterOwner.phone = updateData.phone || theaterOwner.phone;

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      theaterOwner.password = await bcrypt.hash(updateData.password, salt);
    }

    if (profileImage) {
      theaterOwner.profileImageName =
        profileImage.filename || theaterOwner.profileImageName;
    }

    return await TheaterRepository.saveTheaterOwner(theaterOwner);
  };

  public uploadCertificates = async (
    theaterId: string,
    certificatePath: string
  ) => {
    const theater = await this.theaterRepository.findTheaterById(theaterId);
    if (!theater) {
      throw new Error("Theater not found");
    }

    theater.certificate = certificatePath.replace("Back-End/public/", "");
    theater.verificationStatus = "pending";
    return await theater.save();
  };

  public addTheaterService = async (
    theaterId: string,
    theaterData: Partial<ITheaterDetails>
  ) => {
    const createdTheater = await this.theaterRepository.createTheater(
      theaterId,
      theaterData
    );
    return { status: 201, data: createdTheater };
  };

  public async getAllTheaters() {
    return await this.theaterRepository.getAllTheaters();
  }


  public async getTheaterById(theaterId: string): Promise<ITheaterDetails | null> {
    try {
      const theater = await this.theaterRepository.findTheaterById(theaterId);
      if (!theater) {
        throw { status: 404, data: { message: "Theater not found" } };
      }

      return theater;
    } catch (error) {
      console.error("Error fetching theater details:", error);
      throw { status: 500, data: { message: "Server error" } };
    }
  }

  public async updateTheaterData(
    theaterId: any,
    updateData: Partial<ITheaterDetails>,
    files: any
  ): Promise<ITheaterDetails | null> {
    try {
      const theater = await this.theaterRepository.findTheaterById(theaterId);

      if (!theater) {
        throw new Error("Theater not found");
      }

      // Update the theater details as needed
      theater.name = updateData.name || theater.name;
      theater.city = updateData.city || theater.city;
      theater.addressLine1 = updateData.addressLine1 || theater.addressLine1;
      theater.addressLine2 = updateData.addressLine2 || theater.addressLine2;
      theater.pincode = updateData.pincode || theater.pincode;
      theater.state = updateData.state || theater.state;
      theater.country = updateData.country || theater.country;
      theater.description = updateData.description || theater.description;
      theater.amenities = updateData.amenities
        ? updateData.amenities.map((item: string) => item.trim())
        : theater.amenities;
      theater.latitude = updateData.latitude || theater.latitude;
      theater.longitude = updateData.longitude || theater.longitude;

      // Handling images and other fields
      if (files && files.length > 0) {
        const newImages = files
          .map((file: { path: string }) => {
            return file.path.split("\\").pop()?.split("/").pop();
          })
          .filter((image: string | undefined) => image !== undefined);

        theater.images = newImages;
      }

      if (
        Array.isArray(updateData.removeImages) &&
        updateData.removeImages.length > 0
      ) {
        theater.images = theater.images.filter(
          (image: string) => !updateData.removeImages!.includes(image)
        );
      }

      // Save the updated theater and return the updated theater
      const updatedTheater = await theater.save();
      return updatedTheater;
    } catch (error) {
      throw error;
    }
  }

  public async deleteTheaterService(id: string): Promise<boolean> {
    const deletedTheater = await this.theaterRepository.deleteOneById(id);
    return deletedTheater;
  }

  public getTheatersByMovieTitle = async (movieTitle: string) => {
    try {
      const movie = await Movie.findOne({ title: movieTitle }).exec();
      if (!movie) {
        throw new Error("Movie not found");
      }

      const theaters = await TheaterDetails.find({ movies: movie._id }).exec();
      return theaters;
    } catch (error) {
      throw new Error("Error fetching theater by movie name");
    }
  };

  public updateOfferService = async (
    offerId: string,
    offerData: OfferData
  ): Promise<any> => {
    const {
      offerName,
      paymentMethod,
      offerDescription,
      discountValue,
      minPurchaseAmount,
      validityStart,
      validityEnd,
      applicableTheaters,
    } = offerData;

    // Validate input
    if (
      !offerName ||
      !paymentMethod ||
      !offerDescription ||
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

    // Convert applicableTheaters to ObjectId[]
    const theaterObjectIds = applicableTheaters.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Merge updates and pass to the repository
    const updatedOffer = await TheaterRepository.updateOffer(offerId, {
      ...offerData,
      validityStart: parsedValidityStart,
      validityEnd: parsedValidityEnd,
      applicableTheaters: theaterObjectIds,
    });

    if (!updatedOffer) {
      throw { statusCode: 404, message: "Offer not found" };
    }

    return updatedOffer;
  };

  public async deleteOfferHandler(offerId: string): Promise<IOffer | null> {
    const deletedOffer = await Offer.findByIdAndDelete(offerId);
    return deletedOffer;
  }

  public async logoutTheaterOwnerService(): Promise<any> {
    return true;
  }
}
