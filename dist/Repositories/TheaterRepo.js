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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheaterRepository = void 0;
const MoviesModel_1 = require("../Models/MoviesModel");
const OffersModel_1 = require("../Models/OffersModel");
const TheaterDetailsModel_1 = __importDefault(require("../Models/TheaterDetailsModel"));
const TheaterOwnerModel_1 = __importDefault(require("../Models/TheaterOwnerModel"));
const inversify_1 = require("inversify");
const BaseRepository_1 = require("./Base/BaseRepository");
let TheaterRepository = class TheaterRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(TheaterOwnerModel_1.default);
        this.theaterOwnerModel = TheaterOwnerModel_1.default;
        this.createTheater = async (theaterId, theaterData) => {
            const theater = new TheaterDetailsModel_1.default({ ...theaterData, theaterId });
            return await theater.save();
        };
    }
    async getAllTheaterOwners() {
        try {
            await TheaterOwnerModel_1.default.find({});
        }
        catch (error) {
            throw new Error("Error fetching theater owners");
        }
    }
    async findTheaterOwnerById(theaterOwnerId) {
        return await TheaterOwnerModel_1.default.findById(theaterOwnerId);
    }
    async findTheaterById(theaterId) {
        return await TheaterDetailsModel_1.default.findById(theaterId);
    }
    async findTheaterOwnerByEmail(email) {
        return await TheaterOwnerModel_1.default.findOne({ email });
    }
    async saveTheaterOwner(theaterOwnerData) {
        const theaterOwner = new TheaterOwnerModel_1.default(theaterOwnerData);
        return await theaterOwner.save();
    }
    async findTheaterOwnerByResetToken(resetToken) {
        return await TheaterOwnerModel_1.default.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });
    }
    async updateOtpDetails(theaterOwnerId, otp) {
        await TheaterOwnerModel_1.default.findByIdAndUpdate(theaterOwnerId, {
            otp,
            otpVerified: false,
            otpGeneratedAt: new Date(),
        });
    }
    async createTheaterOwner(theaterOwnerDetails) {
        const theaterOwner = new TheaterOwnerModel_1.default(theaterOwnerDetails);
        return theaterOwner.save();
    }
    async getAllTheaters() {
        try {
            const theaters = await TheaterDetailsModel_1.default.find({});
            return theaters;
        }
        catch (error) {
            throw new Error("Error fetching theater owners");
        }
    }
    async updateTheaterOwner(theaterOwnerId, updates) {
        return await TheaterOwnerModel_1.default.findByIdAndUpdate(theaterOwnerId, updates, { new: true });
    }
    async findTheatersByMovieTitle(movieTitle) {
        try {
            const movie = await MoviesModel_1.Movie.findOne({ title: movieTitle }).exec();
            if (!movie) {
                throw new Error('Movie not found');
            }
            const theaters = await TheaterDetailsModel_1.default.find({ movies: movie._id }).exec();
            return theaters;
        }
        catch (error) {
            throw new Error("Error fetching theater by movie name");
        }
    }
    async updateOffer(offerId, updates) {
        try {
            const offer = await OffersModel_1.Offer.findByIdAndUpdate(offerId, updates, {
                new: true,
            });
            if (!offer) {
                throw { statusCode: 404, message: "Offer not found" };
            }
            return offer;
        }
        catch (error) {
            console.error("Error updating the offer:", error);
            throw { statusCode: 500, message: "Internal server error" };
        }
    }
    async deleteOneById(id) {
        const result = await TheaterDetailsModel_1.default.findByIdAndDelete(id);
        return result !== null;
    }
};
exports.TheaterRepository = TheaterRepository;
exports.TheaterRepository = TheaterRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], TheaterRepository);
exports.default = new TheaterRepository();
//# sourceMappingURL=TheaterRepo.js.map