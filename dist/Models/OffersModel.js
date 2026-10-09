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
exports.Offer = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const OfferSchema = new mongoose_1.Schema({
    paymentMethod: { type: String, required: true },
    offerName: { type: String, required: true },
    description: { type: String, required: true },
    discountValue: { type: Number, default: 0 },
    minPurchaseAmount: { type: Number, default: 0 },
    applicableTheaters: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "TheaterDetails" }],
    validityStart: { type: Date, required: true },
    validityEnd: { type: Date, required: true },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "TheaterOwner", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
exports.Offer = (0, mongoose_1.model)("Offer", OfferSchema);
//# sourceMappingURL=OffersModel.js.map