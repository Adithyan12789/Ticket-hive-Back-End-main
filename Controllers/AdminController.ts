import asyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { Movie } from "../Models/MoviesModel";
import { Offer } from "../Models/OffersModel";
import { IAdminService } from "../Interface/IAdmin/IService";

@injectable()
export class AdminController {
  constructor(
    @inject("IAdminService") private readonly adminService: IAdminService
  ) { }

  adminLogin = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      console.log("AdminController: Received login request. Body keys:", Object.keys(req.body || {}));
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      try {
        console.log(`Admin login attempt for email: ${email}`);
        const adminData = await this.adminService.adminLoginService(
          email,
          password,
          res
        );
        console.log("Admin login successful");
        res.status(200).json(adminData);
      } catch (error: any) {
        console.error(`Admin login failed: ${error.message}`);
        res.status(400).json({ message: error.message });
      }
    }
  );

  getAllUsers = expressAsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const users = await this.adminService.getAllUsers();
      res.status(200).json(users);
    }
  );

  getAllTheaterOwners = expressAsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const theaterOwners = await this.adminService.getAllTheaterOwners();
      res.status(200).json(theaterOwners);
    }
  );

  // AdminController.ts
  public blockUserController = expressAsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { userId } = req.body;

        if (!userId) {
          res.status(400).json({ message: "userId is required" });
          return;
        }

        const user = await this.adminService.blockUser(userId);

        if (user) {
          res.status(200).json({ message: "User blocked successfully", user });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error: any) {
        console.error("Error blocking user:", error.message);
        res
          .status(500)
          .json({ message: error.message || "Internal Server Error" });
      }
    }
  );

  unblockUserController = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {

        const { userId } = req.body;

        if (!userId) {
          res.status(400).json({ message: "userId is required" });
          return;
        }

        const user = await this.adminService.unblockUser(userId);

        if (user) {
          res
            .status(200)
            .json({ message: "User unblocked successfully", user });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error unblocking user:", error);
        res.status(500).json({ message: "Error unblocking user" });
      }
    }
  );

  blockTheaterOwnerController = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {

        const { theaterOwnerId } = req.body;

        if (!theaterOwnerId) {
          res.status(400).json({ message: "TheaterOwnerId is required" });
          return;
        }

        const theaterOwner = await this.adminService.blockTheaterOwner(theaterOwnerId);

        if (theaterOwner) {
          res.status(200).json({
            message: "Theater Owner blocked successfully",
            theaterOwner,
          });
        } else {
          res.status(404).json({ message: "Theater Owner not found" });
        }
      } catch (error) {
        console.error("Error blocking theater owner:", error);
        res.status(500).json({ message: "Error blocking theater owner" });
      }
    }
  );

  unblockTheaterOwnerController = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {

        const { theaterOwnerId } = req.body;

        if (!theaterOwnerId) {
          res.status(400).json({ message: "TheaterOwnerId is required" });
          return;
        }

        const theaterOwner = await this.adminService.unblockTheaterOwner(theaterOwnerId);

        if (theaterOwner) {
          res.status(200).json({
            message: "Theater Owner unblocked successfully",
            theaterOwner,
          });
        } else {
          res.status(404).json({ message: "Theater Owner not found" });
        }
      } catch (error) {
        console.error("Error unblocking theater owner:", error);
        res.status(500).json({ message: "Error unblocking theater owner" });
      }
    }
  );

  getVerificationDetails = expressAsyncHandler(async (req, res) => {
    const theaters = await this.adminService.getVerificationDetails();
    res.status(200).json(theaters);
  });

  acceptVerification = expressAsyncHandler(async (req, res) => {
    try {
      await this.adminService.acceptVerification(req.params.theaterId);
      res.json({ message: "Verification accepted" });
    } catch (error) {
      console.error("Error accepting verification:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });

  rejectVerification = expressAsyncHandler(async (req, res) => {
    try {
      const { adminId } = req.params;
      const { reason } = req.body;

      await this.adminService.rejectVerification(adminId, reason);
      res.json({ message: "Verification rejected" });
    } catch (error) {
      console.error("Error rejecting verification:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });

  getAllTickets = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      try {
        const tickets = await this.adminService.getAllTicketsService();

        if (!tickets || tickets.length === 0) {
          res.status(404).json({ message: "No tickets found for this user" });
          return;
        }

        const ticketsWithMovieDetails = await Promise.all(
          tickets.map(async (ticket: { movieId: string, offerId: string }) => {
            const movie = await Movie.findById(ticket.movieId).exec();
            const offer = await Offer.findById(ticket.offerId).exec();

            return {
              ticket,
              movieDetails: movie
                ? {
                  title: movie.title,
                  poster: movie.posters,
                  duration: movie.duration,
                  genre: movie.genres,
                }
                : null,

              offerDetails: offer
                ? {
                  offerName: offer.offerName,
                  description: offer.description,
                  discountValue: offer.discountValue,
                  minPurchaseAmount: offer.minPurchaseAmount,
                  validityStart: offer.validityStart,
                  validityEnd: offer.validityEnd,
                }
                : null,
            };
          })
        );

        res.status(200).json({
          success: true,
          tickets: ticketsWithMovieDetails,
        });
      } catch (error: unknown) {
        res.status(500).json({
          success: false,
          message: "Failed to retrieve tickets",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  getAdmins = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const admins = await this.adminService.getAllAdmins();

      res.status(200).json(admins);
    }
  );

  adminLogout = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = this.adminService.adminLogoutService(res);
      res.status(200).json(result);
    }
  );
}
