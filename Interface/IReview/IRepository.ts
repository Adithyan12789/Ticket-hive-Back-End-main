// IReviewRepository.ts

import { IReview } from "../../Models/ReviewModel";
import { AddReviewType } from "../../types/ReviewTypes";

export interface IReviewRepository {
    getAllReviews(): Promise<IReview>;
    getReviewsByMovieId(movieId: string): Promise<IReview>;
    addReview(data: AddReviewType): Promise<IReview>;
    updateAverageRating(movieId: string): Promise<void>;
    voteReview(reviewId: string, userId: string, action: 'like' | 'dislike'): Promise<IReview | null>;
}

