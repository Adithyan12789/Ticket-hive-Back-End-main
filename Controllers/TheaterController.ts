import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { TheaterService } from "../Services/TheaterService";
import EmailUtil from "../Utils/EmailUtil";
import Theater from "../Models/TheaterOwnerModel";
import TheaterTokenService from "../Utils/GenerateTheaterToken";
import { CustomRequest } from "../Middlewares/TheaterAuthMiddleware";
import mongoose, { ObjectId } from "mongoose";
import TheaterDetails from "../Models/TheaterDetailsModel";
import { Movie } from "../Models/MoviesModel";
import { IScreen, Screens } from "../Models/ScreensModel";
import User from "../Models/UserModel";
import { Offer } from "../Models/OffersModel";
import { Booking } from "../Models/bookingModel";
import { ISchedule, Schedule } from "../Models/ScheduleModel";
import { Notification } from "../Models/NotificationModel";
import { inject, injectable } from "inversify";
import { ITheaterService } from "../Interface/ITheater/IService";
import { IOfferService } from "../Interface/IOffer/IService";

@injectable()
export class TheaterController {
  constructor(
    @inject("ITheaterService") private readonly theaterService: ITheaterService,
    @inject("IOfferService") private readonly offerService: IOfferService,
  ) { }

  authTheaterOwner = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      try {
        const theater = await this.theaterService.authTheaterOwnerService(
          email,
          password
        );

        const token = TheaterTokenService.generateTheaterToken(res, theater._id.toString());

        res.status(200).json({
          id: theater._id,
          name: theater.name,
          email: theater.email,
          token,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === "Your account has been blocked") {
            res.status(401).json({
              message: "Your account has been blocked. Please contact support.",
            });
          } else if (err.message === "Invalid Email or Password") {
            res.status(401).json({ message: "Invalid email or password" });
          } else {
            res
              .status(500)
              .json({ message: "An error occurred during authentication" });
          }
        } else {
          res
            .status(500)
            .json({ message: "An error occurred during authentication" });
        }
      }
    }
  );

  googleLoginTheaterOwner = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { googleName: name, googleEmail: email } = req.body;

      if (!email || !name) {
        res.status(400).json({ message: "Google Name and Email are required" });
        return;
      }

      try {
        const theaterOwner = await this.theaterService.googleLoginTheaterOwnerService(name, email);

        res.status(200).json({
          success: true,
          data: {
            _id: theaterOwner._id,
            name: theaterOwner.name,
            email: theaterOwner.email,
          },
        });
      } catch (error: any) {
        console.error("Error in Google Login:", error.message);
        res
          .status(error.statusCode || 500)
          .json({ message: error.message || "Internal server error" });
      }
    }
  );

  registerTheaterOwner = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { name, email, password, phone } = req.body;

      try {
        const theater = await this.theaterService.registerTheaterOwnerService(
          name,
          email,
          password,
          phone
        );

        const otpSent = !theater.otpVerified;

        res.status(201).json({
          id: theater._id.toString(),
          name: theater.name,
          email: theater.email,
          otpSent,
          message: otpSent
            ? "Theater Owner registered successfully. OTP sent."
            : "Theater Owner already registered but OTP not verified.",
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === "Email already exists.") {
            res.status(400).json({
              message: "Theater Owner with this email already exists",
            });
          } else if (err.message === "Email exists but OTP is not verified.") {
            res
              .status(400)
              .json({ message: "Email exists but OTP is not verified." });
          } else if (err instanceof Error) {
            res.status(500).json({ message: err.message || "An error occurred during registration" });
          }
        }
      }
    }
  );

  verifyTheaterOwnerOTP = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, otp } = req.body;

      try {
        await this.theaterService.verifyTheaterOwnerOtpService(email, otp);
        res.status(200).json({ message: "OTP verified successfully" });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "Incorrect OTP") {
          res.status(400).json({ message: "Incorrect OTP" });
        } else if (err instanceof Error && err.message === "OTP expired") {
          res
            .status(400)
            .json({ message: "OTP has expired. Please request a new one" });
        } else {
          res
            .status(500)
            .json({ message: "An error occurred during OTP verification" });
        }
      }
    }
  );

  resendTheaterOwnerOtp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      try {
        await this.theaterService.resendTheaterOwnerOtpService(email);
        res.status(200).json({ message: "OTP resent successfully" });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "Theater Owner not found") {
          res
            .status(404)
            .json({ message: "Theater Owner with this email not found" });
        } else if (
          err instanceof Error &&
          err.message === "Failed to send OTP"
        ) {
          res
            .status(500)
            .json({ message: "Failed to resend OTP. Please try again" });
        } else {
          res.status(500).json({ message: "An unexpected error occurred" });
        }
      }
    }
  );

  forgotTheaterOwnerPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      try {
        const resetToken =
          await this.theaterService.forgotTheaterOwnerPasswordService(email);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const resetUrl = `${frontendUrl}/theater-reset-password/${resetToken}`;

        await EmailUtil.sendResetPasswordEmail(email, resetUrl);
        res.status(200).json({ message: "Password reset email sent" });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "Theater Owner not found") {
          res
            .status(404)
            .json({ message: "Theater Owner with this email not found" });
        } else if (
          err instanceof Error &&
          err.message === "Failed to send email"
        ) {
          res
            .status(500)
            .json({ message: "Failed to send reset email. Please try again" });
        } else {
          res.status(500).json({
            message: "An error occurred during password reset request",
          });
        }
      }
    }
  );

  resetTheaterOwnerPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { password } = req.body;
      const resetToken = req.params.token;

      if (!resetToken || !password) {
        res.status(400).json({ message: "Token and password are required" });
        return;
      }

      try {
        await this.theaterService.resetTheaterOwnerPasswordService(
          resetToken,
          password
        );
        res.status(200).json({ message: "Password reset successfully" });
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.message === "Invalid or expired token"
        ) {
          res.status(400).json({ message: "Invalid or expired token" });
        } else {
          res
            .status(500)
            .json({ message: "An error occurred during password reset" });
        }
      }
    }
  );

  getTheaterOwners = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const admins = await this.theaterService.getAllTheaterOwners();

      res.status(200).json(admins);
    }
  );

  getTheaterProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {

      const theaterOwnerId = req.theaterOwner?._id || null;

      if (!theaterOwnerId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const theaterOwner = await this.theaterService.getTheaterOwnerProfile(
        theaterOwnerId
      );

      res.status(200).json(theaterOwner);
    }
  );

  updateTheaterProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<any> => {
      if (!req.theaterOwner) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      try {
        const updateData = { ...req.body };

        const fileData = req.file
          ? { filename: req.file.filename }
          : { filename: undefined };

        const updatedTheaterOwner =
          await this.theaterService.updateTheaterOwnerProfileService(
            req.theaterOwner._id,
            updateData,
            fileData
          );

        return res.status(200).json({
          _id: updatedTheaterOwner._id,
          name: updatedTheaterOwner.name,
          phone: updatedTheaterOwner.phone,
          profileImageName: updatedTheaterOwner.profileImageName,
        });
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.message === "Current password is incorrect"
        ) {
          res.status(404).json({ message: "Current password is incorrect" });
        } else {
          res.status(500).json({
            message: "An error occurred",
          });
        }
      }
    }
  );

  uploadVerificationDetailsHandler = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const theaterId = req.params.theaterId;

      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const certificatePath = req.file.path
        .replace(/.*public[\\/]/, "")
        .replace(/\\/g, "/");

      try {
        await this.theaterService.uploadCertificates(
          theaterId,
          certificatePath
        );
        res
          .status(200)
          .json({ message: "Verification details submitted successfully" });
      } catch (error: any) {
        res.status(404).json({ message: error.message });
      }
    }
  );

  addTheaterController = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const {
        name,
        city,
        addressLine1,
        addressLine2,
        pincode,
        state,
        country,
        showTimes,
        description,
        amenities,
        latitude,
        longitude,
        ticketPrice,
      } = req.body;

      if (
        !name ||
        !city ||
        !addressLine1 ||
        !pincode ||
        !state ||
        !country ||
        !showTimes ||
        !description ||
        !latitude ||
        !longitude ||
        !ticketPrice
      ) {
        res.status(400).json({ message: "All fields are required" });
        return;
      }

      if (!req.theaterOwner || req.theaterOwner.isBlocked) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const images: string[] = Array.isArray(req.files)
        ? req.files.map((file: Express.Multer.File) => {
          return file.filename;
        })
        : [];

      try {
        const showTimesArray = Array.isArray(showTimes)
          ? showTimes
          : [showTimes];

        const response = await this.theaterService.addTheaterService(
          req.theaterOwner._id,
          {
            theaterOwnerId: new mongoose.Types.ObjectId(req.theaterOwner._id),
            name,
            city,
            addressLine1,
            addressLine2,
            pincode,
            state,
            country,
            showTimes: showTimesArray.map((time: string) => time.trim()),
            images,
            description,
            ticketPrice,
            amenities: amenities
              .split(",")
              .map((amenity: string) => amenity.trim()),
            latitude,
            longitude,
            isListed: true,
          }
        );
        res.status(response.status).json(response.data);
      } catch (error: any) {
        console.error("Error adding theater:", error);
        res
          .status(500)
          .json({ message: "An error occurred while adding the theater" });
      }
    }
  );

  getTheaters = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const theaters = await this.theaterService.getAllTheaters();

      res.status(200).json(theaters);
    }
  );

  public getTheaterByIdHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const theaterId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(theaterId)) {
        res.status(400).json({ message: "Invalid Theater ID" });
        return;
      }

      try {
        const theater = await this.theaterService.getTheaterById(theaterId);

        if (!theater) {
          res.status(404).json({ message: "Theater not found" });
          return;
        }

        res.json(theater);
      } catch (error) {
        console.error("Error in handler:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  public updateTheaterHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const updateData = req.body;
      const files = req.files;

      try {
        const updatedTheater = await this.theaterService.updateTheaterData(
          id,
          updateData,
          files
        );

        if (!updatedTheater) {
          res.status(404).json({ message: "Theater not found for updating" });
          return;
        }

        res.status(200).json(updatedTheater);
      } catch (error: any) {
        console.error("Error updating theater:", error);
        res.status(500).json({ message: "Error updating theater", error: error.message });
      }
    }
  );

  deleteTheaterHandler = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {

      const { id } = req.params;

      try {
        const deletedTheater = await this.theaterService.deleteTheaterService(id);

        if (!deletedTheater) {
          res.status(404).json({ message: "Theater not found for deletion" });
          return;
        }

        res
          .status(200)
          .json({ message: "Theater deleted successfully", deletedTheater });
      } catch (error: any) {
        console.error("Error deleting theater:", error);
        res
          .status(500)
          .json({ message: "Error deleting theater", error: error.message });
      }
    }
  );


  getTheatersByMovieTitle = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { movieTitle } = req.params;
      const { userId, date } = req.query;

      try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }

        let movie: any;
        if (mongoose.Types.ObjectId.isValid(movieTitle)) {
          movie = await Movie.findById(movieTitle);
        } else {
          movie = await Movie.findOne({ title: movieTitle });
        }

        if (!movie) {
          res.status(404).json({ message: "Movie not found" });
          return;
        }

        const screens = await Screens.find({
          schedule: { $exists: true, $ne: [] },
        })
          .populate({
            path: "theater",
            select:
              "name amenities description ticketPrice owner addressLine1 addressLine2 pincode state country city longitude latitude",
          })
          .populate({
            path: "schedule",
            populate: {
              path: "showTimes.movie",
              select: "title",
            },
          });

        const screensWithMovie = screens.filter((screen) =>
          (screen.schedule as unknown as any[]).some((schedule) =>
            schedule.showTimes.some(
              (showTime: any) => {
                const showTimeMovieId = showTime.movie?._id || showTime.movie;
                return showTimeMovieId && showTimeMovieId.toString() === movie._id.toString();
              }
            )
          )
        );

        const theaters = screensWithMovie
          .map((screen: any) => screen.theater)
          .filter(
            (value, index, self) =>
              value &&
              self.findIndex(
                (t: any) => t._id.toString() === value._id.toString()
              ) === index
          );

        let filteredSchedules = await Schedule.find({
          screen: { $in: screensWithMovie.map((screen) => screen._id) },
          "showTimes.movie": movie._id,
        })
          .populate({ path: "screen", select: "screenNumber theater" })
          .populate({ path: "showTimes.movie", select: "title" });

        if (date && typeof date === "string") {
          const selectedDate = new Date(date);
          filteredSchedules = filteredSchedules.filter((schedule) => {
            const scheduleDate = new Date(schedule.date);
            return (
              scheduleDate.getFullYear() === selectedDate.getFullYear() &&
              scheduleDate.getMonth() === selectedDate.getMonth() &&
              scheduleDate.getDate() === selectedDate.getDate()
            );
          });
        }

        res.status(200).json({
          user,
          theaters,
          screens: screensWithMovie,
          schedules: filteredSchedules,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          res.status(500).json({ message: "An error occurred", error: err.message });
        } else {
          res.status(500).json({ message: "An unexpected error occurred" });
        }
      }
    }
  );

  getStatsController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { ownerId } = req.params;

        // Fetch theaters for the given owner
        const theaters = await TheaterDetails.find({ theaterOwnerId: ownerId });

        // Fetch bookings for these theaters, populating user and movie details
        const bookings = await Booking.find({
          theater: { $in: theaters.map((t) => t._id) },
        })
          .populate("user", "_id name email")
          .populate("movie", "title");  // Populate movie title

        // Calculate total earnings from all bookings
        const totalEarnings = bookings.reduce(
          (sum, booking) => sum + booking.totalPrice,
          0
        );

        // Calculate unique users by creating a Set of user IDs
        const uniqueUsers = new Set(
          bookings.map((booking) => booking.user._id.toString())
        );

        // Calculate unique movies by creating a Set of movie IDs
        const uniqueMovies = new Set(
          bookings.map((booking) => booking.movie._id.toString())
        );

        // Prepare stats
        const stats = {
          theaters: theaters.length,
          users: uniqueUsers.size, // Count of unique users
          movies: uniqueMovies.size, // Count of unique movies
          bookings: bookings.length,
          totalEarnings,
        };

        // Return the stats and bookings with populated movie titles
        res.status(200).json({ stats, theaters, bookings });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: "Error fetching data", error: error });
      }
    }
  );


  logoutTheaterOwner = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await this.theaterService.logoutTheaterOwnerService();
      const isProduction = process.env.NODE_ENV === "production";
      
      res.cookie("theaterOwnerJwt", "", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        expires: new Date(0),
        path: "/",
      });
      res.status(200).json({ message: "Theater Owner Logged out" });
    }
  );
}
