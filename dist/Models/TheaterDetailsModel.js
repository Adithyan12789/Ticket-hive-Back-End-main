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
const mongoose_1 = __importStar(require("mongoose"));
const theaterDetailsSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: false },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    images: { type: [String], required: true, default: [] },
    showTimes: { type: [String], required: true, default: [] },
    description: { type: String, required: true },
    amenities: { type: [String], required: true },
    removeImages: { type: [String] },
    isListed: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    theaterOwnerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TheaterOwner', required: true },
    certificate: { type: String },
    verificationStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    latitude: {
        type: Number,
        min: -90,
        max: 90,
        validate: {
            validator: (value) => value >= -90 && value <= 90,
            message: "Latitude must be between -90 and 90 degrees",
        },
    },
    longitude: {
        type: Number,
        min: -180,
        max: 180,
        validate: {
            validator: (value) => value >= -180 && value <= 180,
            message: "Longitude must be between -180 and 180 degrees",
        },
    },
    movies: { type: [String], required: false },
    ticketPrice: { type: Number, required: true },
}, {
    timestamps: true,
});
const TheaterDetails = mongoose_1.default.model('TheaterDetails', theaterDetailsSchema);
exports.default = TheaterDetails;
//# sourceMappingURL=TheaterDetailsModel.js.map