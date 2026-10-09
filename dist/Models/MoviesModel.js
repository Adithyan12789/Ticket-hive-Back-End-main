"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Movie = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MovieSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    genres: { type: [String], required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true },
    languages: { type: [String], required: true },
    images: { type: [String], required: true, default: [] },
    casts: { type: [String], required: true },
    castsImages: { type: [String], required: true, default: [] },
    director: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    posters: { type: String, required: true },
    banners: { type: [String], required: true },
    review: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Review" },
    averageRating: { type: Number, default: 0 },
});
MovieSchema.methods.calculateAverageRating = async function () {
    const reviews = await mongoose_1.default.model("Review").find({ movie: this._id });
    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        this.averageRating = totalRating / reviews.length;
    }
    else {
        this.averageRating = 0;
    }
    await this.save();
};
exports.Movie = (0, mongoose_1.model)("Movie", MovieSchema);
//# sourceMappingURL=MoviesModel.js.map