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
exports.NotificationController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const inversify_1 = require("inversify");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.getUnreadNotifications = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?._id;
            if (!userId) {
                res.status(400).json({ message: "User ID is required" });
                return;
            }
            try {
                const notifications = await this.notificationService.getUnreadNotifications(userId);
                res.json(notifications);
            }
            catch (error) {
                res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
            }
        });
        this.markNotificationAsRead = (0, express_async_handler_1.default)(async (req, res) => {
            const { id: notificationId } = req.params;
            const userId = req.user?._id;
            if (!userId) {
                res.status(400).json({ message: "User ID is required" });
                return;
            }
            try {
                const message = await this.notificationService.markNotificationAsRead(userId, notificationId);
                res.json({ message });
            }
            catch (error) {
                res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
            }
        });
        this.clearNotifications = (0, express_async_handler_1.default)(async (req, res) => {
            const userId = req.user?._id;
            if (!userId) {
                res.status(400).json({ message: "User ID is required" });
                return;
            }
            try {
                await this.notificationService.deleteAllNotifications(userId);
                res.json({ message: "All notifications cleared" });
            }
            catch (error) {
                res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
            }
        });
    }
};
exports.NotificationController = NotificationController;
exports.NotificationController = NotificationController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("INotificationService")),
    __metadata("design:paramtypes", [Object])
], NotificationController);
//# sourceMappingURL=NotificationController.js.map