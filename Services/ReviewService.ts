import { inject, injectable } from "inversify";
import { IReviewService } from "../Interface/IReview/IService";
import { IReviewRepository } from "../Interface/IReview/IRepository";
import { IReview } from "../Models/ReviewModel";

@injectable()
export class ReviewService implements IReviewService {
  constructor(
    @inject("IReviewRepository") private reviewRepository: IReviewRepository
  ) { }

  public async getAllReviewsService(): Promise<any> {
    return await this.reviewRepository.getAllReviews();
  }

  public async getReviewsByMovieId(movieId: string): Promise<IReview> {
    return await this.reviewRepository.getReviewsByMovieId(movieId);
  }

  public async addReview(data: {
    movieId: string;
    userId: string;
    rating: number;
    review: string;
  }): Promise<IReview> {
    // Add the review using the repository
    return await this.reviewRepository.addReview(data);
  }

  public async updateAverageRating(movieId: string): Promise<void> {
    // Update the average rating using the repository
    await this.reviewRepository.updateAverageRating(movieId);
  }

  public async voteReview(reviewId: string, userId: string, action: 'like' | 'dislike'): Promise<IReview | null> {
    return await this.reviewRepository.voteReview(reviewId, userId, action);
  }
}
