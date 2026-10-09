"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const inversify_1 = require("inversify");
const BaseRepository_1 = require("./Base/BaseRepository");
const ReviewModel_1 = require("../Models/ReviewModel");
const MoviesModel_1 = require("../Models/MoviesModel");
const mongoose_1 = require("mongoose");
let ReviewRepository = class ReviewRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(ReviewModel_1.Review);
    }
    async getAllReviews() {
        return await ReviewModel_1.Review.find({}).populate("user", "name").populate("movie", "title");
    }
    async getReviewsByMovieId(movieId) {
        return await ReviewModel_1.Review.find({ movie: movieId }).populate("user", "name email");
    }
    async addReview(data) {
        const { movieId, userId, rating, review } = data;
        const newReview = new ReviewModel_1.Review({
            movie: movieId,
            user: userId,
            rating: rating,
            comment: review,
        });
        const savedReview = await newReview.save();
        await MoviesModel_1.Movie.findByIdAndUpdate(movieId, {
            $push: { reviews: savedReview._id },
        });
        return savedReview;
    }
    async updateAverageRating(movieId) {
        const reviews = await ReviewModel_1.Review.find({ movie: movieId });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            await MoviesModel_1.Movie.findByIdAndUpdate(movieId, { averageRating });
        }
        else {
            await MoviesModel_1.Movie.findByIdAndUpdate(movieId, { averageRating: 0 });
        }
    }
    async voteReview(reviewId, userId, action) {
        const review = await ReviewModel_1.Review.findById(reviewId);
        if (!review)
            return null;
        if (!review.likedBy)
            review.likedBy = [];
        if (!review.dislikedBy)
            review.dislikedBy = [];
        const userIdObj = new mongoose_1.Types.ObjectId(userId);
        const likedIndex = review.likedBy.findIndex((id) => id.toString() === userId);
        const dislikedIndex = review.dislikedBy.findIndex((id) => id.toString() === userId);
        if (action === 'like') {
            if (likedIndex !== -1) {
                review.likedBy.splice(likedIndex, 1);
            }
            else {
                review.likedBy.push(userIdObj);
                if (dislikedIndex !== -1) {
                    review.dislikedBy.splice(dislikedIndex, 1);
                }
            }
        }
        else if (action === 'dislike') {
            if (dislikedIndex !== -1) {
                review.dislikedBy.splice(dislikedIndex, 1);
            }
            else {
                review.dislikedBy.push(userIdObj);
                if (likedIndex !== -1) {
                    review.likedBy.splice(likedIndex, 1);
                }
            }
        }
        await review.save();
        return review;
    }
};
exports.ReviewRepository = ReviewRepository;
exports.ReviewRepository = ReviewRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], ReviewRepository);
//# sourceMappingURL=ReviewRepo.js.map