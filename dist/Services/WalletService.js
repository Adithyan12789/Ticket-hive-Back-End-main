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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const uuid_1 = require("uuid");
const inversify_1 = require("inversify");
let WalletService = class WalletService {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }
    async addMoneyToWallet(userId, amount, description) {
        const wallet = await this.walletRepository.findWalletByUserId(userId);
        const transaction = {
            transactionId: (0, uuid_1.v4)(),
            type: "credit",
            amount,
            description,
            date: new Date(),
            status: "success",
        };
        if (!wallet) {
            await this.walletRepository.createWallet({
                user: userId,
                balance: amount,
                transactions: [transaction],
            });
        }
        else {
            wallet.balance += amount;
            wallet.transactions.push(transaction);
            await this.walletRepository.updateWallet(wallet);
        }
    }
    async getTransactionHistory(userId) {
        const wallet = await this.walletRepository.findWalletByUserId(userId);
        if (!wallet) {
            return { balance: 0, transactions: [] };
        }
        return { balance: wallet.balance, transactions: wallet.transactions };
    }
    async deductAmountFromWallet(userId, amount, description) {
        const wallet = await this.walletRepository.findWalletByUserId(userId);
        if (!wallet)
            throw new Error("Wallet not found");
        if (wallet.balance < amount)
            throw new Error("Insufficient funds");
        wallet.balance -= amount;
        wallet.transactions.push({
            transactionId: (0, uuid_1.v4)(),
            type: "debit",
            amount,
            description,
            date: new Date(),
            status: "success",
        });
        await this.walletRepository.updateWallet(wallet);
    }
    async addCashbackToWallet(userId, amount, description) {
        await this.addMoneyToWallet(userId, amount, description);
    }
    async getWalletBalance(userId) {
        const wallet = await this.walletRepository.findWalletByUserId(userId);
        if (!wallet)
            throw new Error("Wallet not found");
        return wallet.balance;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IWalletRepository")),
    __metadata("design:paramtypes", [Object])
], WalletService);
//# sourceMappingURL=WalletService.js.map