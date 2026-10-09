import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify"
import { IReviewService } from "../Interface/IReview/IService";
import mongoose from "mongoose";

@injectable()
export class ReviewController {
  constructor(
    @inject("IReviewService") private readonly reviewService: IReviewService,
  ) { }

  getAllReviewsController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      try {
        const reviews = await this.reviewService.getAllReviewsService();

        if (!reviews) {
          res.status(404).json({ message: "No reviews found for this movie" });
          return;
        }

        res.status(200).json(reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Error fetching reviews", error });
      }
    }
  );

  getReviewsController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { movieId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        res.status(400).json({ message: "Invalid Movie ID" });
        return;
      }

      try {
        const reviews = await this.reviewService.getReviewsByMovieId(movieId);

        if (!reviews) {
          res.status(404).json({ message: "No reviews found for this movie" });
          return;
        }

        res.status(200).json(reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Error fetching reviews", error });
      }
    }
  );

  addReviewsController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { movieId, userId, rating, review } = req.body;

      if (!mongoose.Types.ObjectId.isValid(movieId) || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ message: "Invalid Movie or User ID" });
        return;
      }

      if (!rating || !review) {
        res.status(400).json({ message: "Rating and comment are required" });
        return;
      }

      try {
        const newReview = await this.reviewService.addReview({ movieId, userId, rating, review });

        // Recalculate and update average rating
        await this.reviewService.updateAverageRating(movieId);

        res.status(201).json({
          message: "Review added successfully",
          review: newReview,
        });
      } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Error adding review", error });
      }
    }
  );

  voteReviewController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { reviewId } = req.params;
      const { userId, action } = req.body;

      if (!mongoose.Types.ObjectId.isValid(reviewId) || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ message: "Invalid Review or User ID" });
        return;
      }

      if (!['like', 'dislike'].includes(action)) {
        res.status(400).json({ message: "Invalid action" });
        return;
      }

      try {
        const updatedReview = await this.reviewService.voteReview(reviewId, userId, action);

        if (!updatedReview) {
          res.status(404).json({ message: "Review not found" });
          return;
        }

        res.status(200).json({
          message: "Vote recorded successfully",
          review: updatedReview,
        });
      } catch (error) {
        console.error("Error voting review:", error);
        res.status(500).json({ message: "Error voting review", error });
      }
    }
  );
}