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
exports.TheaterService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const TheaterRepo_1 = __importDefault(require("../Repositories/TheaterRepo"));
const EmailUtil_1 = __importDefault(require("../Utils/EmailUtil"));
const TheaterDetailsModel_1 = __importDefault(require("../Models/TheaterDetailsModel"));
const MoviesModel_1 = require("../Models/MoviesModel");
const mongoose_1 = __importDefault(require("mongoose"));
const OffersModel_1 = require("../Models/OffersModel");
const inversify_1 = require("inversify");
let TheaterService = class TheaterService {
    constructor(theaterRepository) {
        this.theaterRepository = theaterRepository;
        this.updateTheaterOwnerProfileService = async (theaterOwnerId, updateData, profileImage) => {
            const theaterOwner = await TheaterRepo_1.default.findTheaterOwnerById(theaterOwnerId);
            if (!theaterOwner) {
                throw new Error("theater Owner not found");
            }
            if (updateData.currentPassword) {
                const isMatch = await theaterOwner.matchPassword(updateData.currentPassword);
                if (!isMatch) {
                    throw new Error("Current password is incorrect");
                }
            }
            theaterOwner.name = updateData.name || theaterOwner.name;
            theaterOwner.phone = updateData.phone || theaterOwner.phone;
            if (updateData.password) {
                const salt = await bcryptjs_1.default.genSalt(10);
                theaterOwner.password = await bcryptjs_1.default.hash(updateData.password, salt);
            }
            if (profileImage) {
                theaterOwner.profileImageName =
                    profileImage.filename || theaterOwner.profileImageName;
            }
            return await TheaterRepo_1.default.saveTheaterOwner(theaterOwner);
        };
        this.uploadCertificates = async (theaterId, certificatePath) => {
            const theater = await this.theaterRepository.findTheaterById(theaterId);
            if (!theater) {
                throw new Error("Theater not found");
            }
            theater.certificate = certificatePath.replace("Back-End/public/", "");
            theater.verificationStatus = "pending";
            return await theater.save();
        };
        this.addTheaterService = async (theaterId, theaterData) => {
            const createdTheater = await this.theaterRepository.createTheater(theaterId, theaterData);
            return { status: 201, data: createdTheater };
        };
        this.getTheatersByMovieTitle = async (movieTitle) => {
            try {
                const movie = await MoviesModel_1.Movie.findOne({ title: movieTitle }).exec();
                if (!movie) {
                    throw new Error("Movie not found");
                }
                const theaters = await TheaterDetailsModel_1.default.find({ movies: movie._id }).exec();
                return theaters;
            }
            catch (error) {
                throw new Error("Error fetching theater by movie name");
            }
        };
        this.updateOfferService = async (offerId, offerData) => {
            const { offerName, paymentMethod, offerDescription, discountValue, minPurchaseAmount, validityStart, validityEnd, applicableTheaters, } = offerData;
            if (!offerName ||
                !paymentMethod ||
                !offerDescription ||
                !discountValue ||
                minPurchaseAmount === undefined ||
                !validityStart ||
                !validityEnd ||
                !Array.isArray(applicableTheaters) ||
                applicableTheaters.length === 0) {
                throw { statusCode: 400, message: "All fields are required" };
            }
            const parsedValidityStart = new Date(validityStart);
            const parsedValidityEnd = new Date(validityEnd);
            if (isNaN(parsedValidityStart.getTime()) ||
                isNaN(parsedValidityEnd.getTime())) {
                throw { statusCode: 400, message: "Invalid date format" };
            }
            const theaterObjectIds = applicableTheaters.map((id) => new mongoose_1.default.Types.ObjectId(id));
            const updatedOffer = await TheaterRepo_1.default.updateOffer(offerId, {
                ...offerData,
                validityStart: parsedValidityStart,
                validityEnd: parsedValidityEnd,
                applicableTheaters: theaterObjectIds,
            });
            if (!updatedOffer) {
                throw { statusCode: 404, message: "Offer not found" };
            }
            return updatedOffer;
        };
    }
    async authTheaterOwnerService(email, password) {
        const theater = await this.theaterRepository.findTheaterOwnerByEmail(email);
        if (theater && (await theater.matchPassword(password))) {
            if (theater.isBlocked) {
                throw new Error("Your account has been blocked");
            }
            return theater;
        }
        throw new Error("Invalid Email or Password");
    }
    async googleLoginTheaterOwnerService(name, email) {
        let theaterOwner = await this.theaterRepository.findTheaterOwnerByEmail(email);
        if (theaterOwner) {
            return theaterOwner;
        }
        else {
            theaterOwner = await this.theaterRepository.saveTheaterOwner({
                name,
                email,
                otp: "",
                phone: "",
                password: "",
            });
            if (!theaterOwner) {
                throw new Error("Failed to create a new theater owner");
            }
            return theaterOwner;
        }
    }
    async registerTheaterOwnerService(name, email, password, phone) {
        const existingTheaterOwner = await this.theaterRepository.findTheaterOwnerByEmail(email);
        if (existingTheaterOwner) {
            if (!existingTheaterOwner.otpVerified) {
                const otp = crypto_1.default.randomInt(100000, 999999).toString();
                const id = existingTheaterOwner._id.toString();
                await this.theaterRepository.updateOtpDetails(id, otp);
                await EmailUtil_1.default.sendOtpEmail(existingTheaterOwner.email, otp);
                return existingTheaterOwner;
            }
            throw new Error("Email already exists.");
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const newTheaterOwner = await this.theaterRepository.createTheaterOwner({
            name,
            email,
            phone,
            password: hashedPassword,
            otp,
            otpVerified: false,
            otpGeneratedAt: new Date(),
            otpExpires: new Date(Date.now() + 5 * 60 * 1000),
        });
        await EmailUtil_1.default.sendOtpEmail(newTheaterOwner.email, otp);
        return newTheaterOwner;
    }
    async verifyTheaterOwnerOtpService(email, otp) {
        const theater = await this.theaterRepository.findTheaterOwnerByEmail(email);
        if (!theater) {
            throw new Error("Theater owner not found");
        }
        const currentTime = new Date().getTime();
        if (theater.otpExpires) {
            if (currentTime > new Date(theater.otpExpires).getTime()) {
                throw new Error("OTP expired");
            }
        }
        else {
            const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
            if (currentTime - new Date(theater.otpGeneratedAt).getTime() > OTP_EXPIRATION_TIME) {
                throw new Error("OTP expired");
            }
        }
        if (String(theater.otp) === String(otp)) {
            theater.otpVerified = true;
            await theater.save();
            return true;
        }
        throw new Error("Incorrect OTP");
    }
    async resendTheaterOwnerOtpService(email) {
        const theater = await this.theaterRepository.findTheaterOwnerByEmail(email);
        if (!theater) {
            throw new Error("User not found");
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        theater.otp = otp;
        theater.otpGeneratedAt = new Date();
        theater.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        try {
            await this.theaterRepository.updateTheaterOwner(theater._id.toString(), {
                otp: theater.otp,
                otpGeneratedAt: theater.otpGeneratedAt,
                otpExpires: theater.otpExpires,
            });
        }
        catch (err) {
            throw new Error("Failed to save user with new OTP");
        }
        try {
            await EmailUtil_1.default.sendOtpEmail(theater.email, otp);
        }
        catch (err) {
            throw new Error(`Failed to send OTP email: ${err.message} `);
        }
        return theater;
    }
    async forgotTheaterOwnerPasswordService(email) {
        const theater = await this.theaterRepository.findTheaterOwnerByEmail(email);
        if (!theater) {
            throw new Error("User not found");
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        theater.resetPasswordToken = resetToken;
        theater.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
        await theater.save();
        return resetToken;
    }
    async resetTheaterOwnerPasswordService(resetToken, password) {
        const theater = await this.theaterRepository.findTheaterOwnerByResetToken(resetToken);
        if (!theater) {
            throw new Error("Invalid or expired token");
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        theater.password = await bcryptjs_1.default.hash(password, salt);
        theater.resetPasswordToken = undefined;
        theater.resetPasswordExpires = undefined;
        await theater.save();
        return true;
    }
    async getAllTheaterOwners() {
        let theaterOwners = await this.theaterRepository.getAllTheaterOwners();
        return theaterOwners;
    }
    async getTheaterOwnerProfile(theaterOwnerId) {
        const theaterOwner = await this.theaterRepository.findTheaterOwnerById(theaterOwnerId);
        if (!theaterOwner) {
            throw new Error("theater Owner not found");
        }
        return theaterOwner;
    }
    ;
    async getAllTheaters() {
        return await this.theaterRepository.getAllTheaters();
    }
    async getTheaterById(theaterId) {
        try {
            const theater = await this.theaterRepository.findTheaterById(theaterId);
            if (!theater) {
                throw { status: 404, data: { message: "Theater not found" } };
            }
            return theater;
        }
        catch (error) {
            console.error("Error fetching theater details:", error);
            throw { status: 500, data: { message: "Server error" } };
        }
    }
    async updateTheaterData(theaterId, updateData, files) {
        try {
            const theater = await this.theaterRepository.findTheaterById(theaterId);
            if (!theater) {
                throw new Error("Theater not found");
            }
            theater.name = updateData.name || theater.name;
            theater.city = updateData.city || theater.city;
            theater.addressLine1 = updateData.addressLine1 || theater.addressLine1;
            theater.addressLine2 = updateData.addressLine2 || theater.addressLine2;
            theater.pincode = updateData.pincode || theater.pincode;
            theater.state = updateData.state || theater.state;
            theater.country = updateData.country || theater.country;
            theater.description = updateData.description || theater.description;
            theater.amenities = updateData.amenities
                ? updateData.amenities.map((item) => item.trim())
                : theater.amenities;
            theater.latitude = updateData.latitude || theater.latitude;
            theater.longitude = updateData.longitude || theater.longitude;
            if (files && files.length > 0) {
                const newImages = files
                    .map((file) => {
                    return file.path.split("\\").pop()?.split("/").pop();
                })
                    .filter((image) => image !== undefined);
                theater.images = newImages;
            }
            if (Array.isArray(updateData.removeImages) &&
                updateData.removeImages.length > 0) {
                theater.images = theater.images.filter((image) => !updateData.removeImages.includes(image));
            }
            const updatedTheater = await theater.save();
            return updatedTheater;
        }
        catch (error) {
            throw error;
        }
    }
    async deleteTheaterService(id) {
        const deletedTheater = await this.theaterRepository.deleteOneById(id);
        return deletedTheater;
    }
    async deleteOfferHandler(offerId) {
        const deletedOffer = await OffersModel_1.Offer.findByIdAndDelete(offerId);
        return deletedOffer;
    }
    async logoutTheaterOwnerService() {
        return true;
    }
};
exports.TheaterService = TheaterService;
exports.TheaterService = TheaterService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("ITheaterRepository")),
    __metadata("design:paramtypes", [Object])
], TheaterService);
//# sourceMappingURL=TheaterService.js.map