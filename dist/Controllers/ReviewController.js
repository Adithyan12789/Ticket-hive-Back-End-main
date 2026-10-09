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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const inversify_1 = require("inversify");
const mongoose_1 = __importDefault(require("mongoose"));
let ReviewController = class ReviewController {
    constructor(reviewService) {
        this.reviewService = reviewService;
        this.getAllReviewsController = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const reviews = await this.reviewService.getAllReviewsService();
                if (!reviews) {
                    res.status(404).json({ message: "No reviews found for this movie" });
                    return;
                }
                res.status(200).json(reviews);
            }
            catch (error) {
                console.error("Error fetching reviews:", error);
                res.status(500).json({ message: "Error fetching reviews", error });
            }
        });
        this.getReviewsController = (0, express_async_handler_1.default)(async (req, res) => {
            const { movieId } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(movieId)) {
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
            }
            catch (error) {
                console.error("Error fetching reviews:", error);
                res.status(500).json({ message: "Error fetching reviews", error });
            }
        });
        this.addReviewsController = (0, express_async_handler_1.default)(async (req, res) => {
            const { movieId, userId, rating, review } = req.body;
            if (!mongoose_1.default.Types.ObjectId.isValid(movieId) || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
                res.status(400).json({ message: "Invalid Movie or User ID" });
                return;
            }
            if (!rating || !review) {
                res.status(400).json({ message: "Rating and comment are required" });
                return;
            }
            try {
                const newReview = await this.reviewService.addReview({ movieId, userId, rating, review });
                await this.reviewService.updateAverageRating(movieId);
                res.status(201).json({
                    message: "Review added successfully",
                    review: newReview,
                });
            }
            catch (error) {
                console.error("Error adding review:", error);
                res.status(500).json({ message: "Error adding review", error });
            }
        });
        this.voteReviewController = (0, express_async_handler_1.default)(async (req, res) => {
            const { reviewId } = req.params;
            const { userId, action } = req.body;
            if (!mongoose_1.default.Types.ObjectId.isValid(reviewId) || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
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
            }
            catch (error) {
                console.error("Error voting review:", error);
                res.status(500).json({ message: "Error voting review", error });
            }
        });
    }
};
exports.ReviewController = ReviewController;
exports.ReviewController = ReviewController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IReviewService")),
    __metadata("design:paramtypes", [Object])
], ReviewController);
//# sourceMappingURL=ReviewController.js.map