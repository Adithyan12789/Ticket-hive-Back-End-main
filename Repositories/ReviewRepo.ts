import { injectable } from "inversify";
import { BaseRepository } from "./Base/BaseRepository";
import { IReview, Review } from "../Models/ReviewModel";
import { Movie } from "../Models/MoviesModel";
import { IReviewRepository } from "../Interface/IReview/IRepository";
import { Types } from "mongoose";

@injectable()
export class ReviewRepository
  extends BaseRepository<IReview>
  implements IReviewRepository {
  constructor() {
    super(Review);
  }

  public async getAllReviews(): Promise<any> {
    return await Review.find({}).populate("user", "name").populate("movie", "title");
  }

  public async getReviewsByMovieId(movieId: string): Promise<any> {
    return await Review.find({ movie: movieId }).populate("user", "name email");
  }

  public async addReview(data: {
    movieId: string;
    userId: string;
    rating: number;
    review: string;
  }): Promise<IReview> {
    const { movieId, userId, rating, review } = data;

    const newReview = new Review({
      movie: movieId,
      user: userId,
      rating: rating,
      comment: review,
    });

    const savedReview = await newReview.save();

    // Add the review to the movie's reviews array
    await Movie.findByIdAndUpdate(movieId, {
      $push: { reviews: savedReview._id },
    });

    return savedReview;
  }

  public async updateAverageRating(movieId: string): Promise<void> {
    const reviews = await Review.find({ movie: movieId });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      await Movie.findByIdAndUpdate(movieId, { averageRating });
    } else {
      await Movie.findByIdAndUpdate(movieId, { averageRating: 0 });
    }
  }

  public async voteReview(reviewId: string, userId: string, action: 'like' | 'dislike'): Promise<IReview | null> {
    const review = await Review.findById(reviewId);
    if (!review) return null;

    // Ensure arrays exist
    if (!review.likedBy) review.likedBy = [];
    if (!review.dislikedBy) review.dislikedBy = [];

    const userIdObj = new Types.ObjectId(userId);
    const likedIndex = review.likedBy.findIndex((id) => id.toString() === userId);
    const dislikedIndex = review.dislikedBy.findIndex((id) => id.toString() === userId);

    if (action === 'like') {
      if (likedIndex !== -1) {
        // Already liked, remove like
        review.likedBy.splice(likedIndex, 1);
      } else {
        // Add like
        review.likedBy.push(userIdObj);
        // Remove dislike if exists
        if (dislikedIndex !== -1) {
          review.dislikedBy.splice(dislikedIndex, 1);
        }
      }
    } else if (action === 'dislike') {
      if (dislikedIndex !== -1) {
        // Already disliked, remove dislike
        review.dislikedBy.splice(dislikedIndex, 1);
      } else {
        // Add dislike
        review.dislikedBy.push(userIdObj);
        // Remove like if exists
        if (likedIndex !== -1) {
          review.likedBy.splice(likedIndex, 1);
        }
      }
    }

    await review.save();
    return review;
  }
}
