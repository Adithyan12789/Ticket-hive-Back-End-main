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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const theaterOwnerSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    profileImageName: { type: String },
    phone: { type: String, required: false },
    otp: { type: String, required: false },
    otpVerified: { type: Boolean, default: false },
    otpGeneratedAt: { type: Date, default: Date.now },
    isBlocked: { type: Boolean, default: false, },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    favoriteGenres: { type: [String] },
}, {
    timestamps: true,
});
theaterOwnerSchema.methods.matchPassword = async function (password) {
    return bcryptjs_1.default.compare(password, this.password);
};
const TheaterOwner = mongoose_1.default.model('TheaterOwner', theaterOwnerSchema);
exports.default = TheaterOwner;
//# sourceMappingURL=TheaterOwnerModel.js.map