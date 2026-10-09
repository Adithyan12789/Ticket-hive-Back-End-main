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
exports.WalletRepository = void 0;
const inversify_1 = require("inversify");
const WalletModel_1 = __importDefault(require("../Models/WalletModel"));
const BaseRepository_1 = require("./Base/BaseRepository");
let WalletRepository = class WalletRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(WalletModel_1.default);
        this.walletModel = WalletModel_1.default;
    }
    async findWalletByUserId(userId) {
        return WalletModel_1.default.findOne({ user: userId });
    }
    async createWallet(data) {
        await WalletModel_1.default.create(data);
    }
    async updateWallet(wallet) {
        await wallet.save();
    }
};
exports.WalletRepository = WalletRepository;
exports.WalletRepository = WalletRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], WalletRepository);
//# sourceMappingURL=WalletRepo.js.map