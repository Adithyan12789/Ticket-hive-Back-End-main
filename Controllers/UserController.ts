import asyncHandler from "express-async-handler";
import { UserService } from "../Services/UserService";
import EmailUtil from "../Utils/EmailUtil";
import User from "../Models/UserModel";
import TokenService from "../Utils/GenerateToken";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../Models/UserModel";
import { CustomRequest } from "../Middlewares/AuthMiddleware";
import { Movie } from "../Models/MoviesModel";
import { Booking } from "../Models/bookingModel";
import { inject, injectable } from "inversify";
import { IUserService } from "../Interface/IUser/IService";

@injectable()
export class UserController {
  constructor(
    @inject("IUserService") private readonly userService: IUserService
  ) { }

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    try {
      const { accessToken } = await this.userService.refreshToken(refreshToken);

      // Set the new access token in cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.status(200).json({ message: "Token refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing token:", error);
      res.status(401).json({ message: error });
    }
  });

  authUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      try {
        const user = await this.userService.authenticateUser(email, password);

        const accessToken = TokenService.generateAccessToken(
          user._id.toString()
        );

        console.log("controller accessToken: ", accessToken);

        const refreshToken = TokenService.generateRefreshToken(
          user._id.toString()
        );

        console.log("controller refreshToken: ", refreshToken);

        TokenService.setTokenCookies(res, accessToken, refreshToken);

        res.status(200).json({
          id: user._id,
          name: user.name,
          email: user.email,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === "Your account is blocked") {
            res.status(401).json({
              message: "Your account is blocked. Please contact support.",
            });
          } else if (err.message === "Email not verified. Please verify your OTP first.") {
            res.status(403).json({ message: "Email not verified. Please verify your OTP first." });
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

  googleLogin = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { googleName: name, googleEmail: email } = req.body;

      if (!email || !name) {
        res.status(400).json({ message: "Google Name and Email are required" });
        return;
      }

      try {
        const user = await this.userService.handleGoogleLogin(name, email);

        const accessToken = TokenService.generateAccessToken(user._id.toString());
        const refreshToken = TokenService.generateRefreshToken(user._id.toString());

        TokenService.setTokenCookies(res, accessToken, refreshToken);

        const statusCode = user.isNew ? 201 : 200;
        res.status(statusCode).json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      } catch (error: any) {
        res.status(500).json({
          message: "Internal server error",
          error: error.message,
        });
      }
    }
  );


  registerUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { name, email, password, phone } = req.body;

      try {
        const user = await this.userService.registerUserService(
          name,
          email,
          password,
          phone
        );
        const otpSent = !user.otpVerified;

        // If you want to log the user in after registration and send tokens
        if (!otpSent) {
          // Generate both access and refresh tokens for new user
          const accessToken = TokenService.generateAccessToken(
            user._id.toString()
          );
          const refreshToken = TokenService.generateRefreshToken(
            user._id.toString()
          );

          TokenService.setTokenCookies(res, accessToken, refreshToken);
        }

        res.status(201).json({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          otpSent,
          message: otpSent
            ? "User registered successfully. OTP sent."
            : "User already registered but OTP not verified.",
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === "Email already exists.") {
            res
              .status(400)
              .json({ message: "This email is already exist" });
          } else if (err.message === "Email exists but OTP is not verified.") {
            res
              .status(400)
              .json({ message: "Email exists but OTP is not verified." });
          } else if (
            err.message.includes("Email delivery failed") ||
            err.message.includes("Email is not configured")
          ) {
            res.status(500).json({
              message: "Could not send OTP email. Please try again or contact support.",
              error: err.message,
            });
          } else {
            res
              .status(500)
              .json({ message: "An error occurred during registration", error: err.message });
          }
        } else {
          res.status(500).json({ message: "An unexpected error occurred", error: String(err) });
        }
      }
    }
  );

  verifyOTP = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, otp } = req.body;

      try {
        await this.userService.verifyOtpService(email, otp);
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
            .json({ message: "An error occurred during OTP verification", error: String(err) });
        }
      }
    }
  );

  resendOtp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      try {
        await this.userService.resendOtpService(email);
        res.status(200).json({ message: "OTP resent successfully" });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "User not found") {
          res.status(404).json({ message: "User with this email not found" });
        } else if (
          err instanceof Error &&
          err.message === "Failed to send OTP"
        ) {
          res
            .status(500)
            .json({ message: "Failed to resend OTP. Please try again" });
        } else {
          res.status(500).json({ message: "An unexpected error occurred", error: String(err) });
        }
      }
    }
  );

  forgotPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      try {
        const resetToken = await this.userService.forgotPasswordService(email);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        await EmailUtil.sendResetPasswordEmail(email, resetUrl);
        res.status(200).json({ message: "Password reset email sent" });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "User not found") {
          res.status(404).json({ message: "User with this email not found" });
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

  resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { password } = req.body;
      const resetToken = req.params.token;

      if (!resetToken || !password) {
        res.status(400).json({ message: "Token and password are required" });
        return;
      }

      try {
        await this.userService.resetPasswordService(resetToken, password);
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

  saveLocationController = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { city, latitude, longitude } = req.body;

      // Validate latitude and longitude
      if (latitude == null || longitude == null) {
        res
          .status(400)
          .json({ message: "Latitude and longitude are required" });
        return;
      }

      try {
        // Call the service to update the location
        const updatedUser = await this.userService.updateLocation(
          req.user._id.toString(),
          city,
          latitude,
          longitude
        );

        if (!updatedUser) {
          res.status(404).json({ message: "User not found" });
          return;
        }

        res.status(200).json({
          message: "Location updated successfully",
          latitude: updatedUser.latitude,
          longitude: updatedUser.longitude,
        });
      } catch (err) {
        res
          .status(500)
          .json({ message: "An error occurred while saving location" });
      }
    }
  );

  getUserProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await this.userService.getUserProfile(req.user._id);
      res.status(200).json(user);
    }
  );

  updateUserProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      try {
        const updateData = { ...req.body };

        const fileData = req.file
          ? { filename: req.file.filename }
          : { filename: undefined };

        // If password is being changed, validate currentPassword
        if (updateData.password) {
          if (!updateData.currentPassword) {
            res.status(400).json({ message: "Current password is required" });
            return;
          }
        }

        const updatedUser = await this.userService.updateUserProfileService(
          req.user._id,
          updateData,
          fileData
        );

        res.status(200).json({
          _id: updatedUser._id,
          name: updatedUser.name,
          phone: updatedUser.phone,
          profileImageName: updatedUser.profileImageName,
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


  getOffersByTheaterId = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { theaterId } = req.params;
      const userId = req.user?._id;

      try {
        const offers = await this.userService.getOffersByTheaterIdService(theaterId);
        if (!offers || offers.length === 0) {
          res.status(200).json([]);
          return;
        }

        const bookings = await Booking.find({ user: userId })
          .select("offer")
          .exec();

        const usedOfferIds = bookings
          .map((booking) => booking.offer?.toString())
          .filter((offerId): offerId is string => !!offerId);

        const filteredOffers = offers.filter(
          (offer: { id: { toString: () => string; }; }) => !usedOfferIds.includes(offer.id.toString())
        );

        res.status(200).json(filteredOffers);
      } catch (error: any) {
        res
          .status(500)
          .json({ message: error?.message || "Internal server error" });
      }
    }
  );

  logoutUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Optionally, you can perform any other cleanup actions related to the user session here
      await this.userService.logoutUserService();

      // Clear the access token cookie
      res.cookie("accessToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
        expires: new Date(0),
      });

      // Clear the refresh token cookie
      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
        expires: new Date(0),
      });

      res.status(200).json({ message: "User Logged out" });
    }
  );
}

