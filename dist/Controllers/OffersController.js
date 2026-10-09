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
exports.OfferController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const inversify_1 = require("inversify");
let OfferController = class OfferController {
    constructor(offerService) {
        this.offerService = offerService;
        this.addOfferController = (0, express_async_handler_1.default)(async (req, res) => {
            const offerData = req.body;
            console.log("offerData: ", offerData);
            try {
                const createdOffer = await this.offerService.addOfferService(offerData);
                res.status(201).json({
                    message: "Offer created successfully",
                    offer: createdOffer,
                });
            }
            catch (error) {
                console.error("Error creating offer:", error);
                res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
            }
        });
        this.updateOfferController = (0, express_async_handler_1.default)(async (req, res) => {
            const { offerId } = req.params;
            const offerData = req.body;
            try {
                const updatedOffer = await this.offerService.updateOfferService(offerId, offerData);
                res.status(200).json({
                    message: "Offer updated successfully",
                    offer: updatedOffer,
                });
            }
            catch (error) {
                console.error("Error updating offer:", error);
                res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
            }
        });
        this.deleteOfferController = (0, express_async_handler_1.default)(async (req, res) => {
            const { offerId } = req.params;
            try {
                const deletedOffer = await this.offerService.deleteOfferService(offerId);
                if (!deletedOffer) {
                    res.status(404).json({ message: "Offer not found for deletion" });
                    return;
                }
                res.status(200).json({ message: "Offer deleted successfully", deletedOffer });
            }
            catch (error) {
                console.error("Error deleting offer:", error);
                res.status(500).json({ message: "Error deleting offer", error: error.message });
            }
        });
        this.getOffersController = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const offers = await this.offerService.getOffersService();
                res.status(200).json(offers);
            }
            catch (error) {
                console.error("Error fetching offers:", error);
                res.status(500).json({ message: "Server error. Please try again." });
            }
        });
    }
};
exports.OfferController = OfferController;
exports.OfferController = OfferController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IOfferService")),
    __metadata("design:paramtypes", [Object])
], OfferController);
//# sourceMappingURL=OffersController.js.map