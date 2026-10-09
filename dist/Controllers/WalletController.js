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
exports.WalletController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const inversify_1 = require("inversify");
let WalletController = class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
        this.addMoneyToWallet = (0, express_async_handler_1.default)(async (req, res) => {
            const { userId, amount, description } = req.body;
            if (!userId || !amount) {
                res.status(400).json({ message: "User ID and amount are required" });
                return;
            }
            try {
                await this.walletService.addMoneyToWallet(userId, amount, description);
                res.status(200).json({ message: "Money added to wallet successfully" });
            }
            catch (err) {
                console.error("Error adding money to wallet:", err);
                res
                    .status(500)
                    .json({ message: "An error occurred while adding money to wallet" });
            }
        });
        this.getTransactionHistory = (0, express_async_handler_1.default)(async (req, res) => {
            const { userId } = req.params;
            if (!userId) {
                res.status(400).json({ message: "User ID is required" });
                return;
            }
            try {
                const transactions = await this.walletService.getTransactionHistory(userId);
                res.status(200).json({ transactions });
            }
            catch (err) {
                console.error("Error fetching transaction history:", err);
                res
                    .status(500)
                    .json({
                    message: "An error occurred while fetching transaction history",
                });
            }
        });
    }
};
exports.WalletController = WalletController;
exports.WalletController = WalletController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IWalletService")),
    __metadata("design:paramtypes", [Object])
], WalletController);
//# sourceMappingURL=WalletController.js.map