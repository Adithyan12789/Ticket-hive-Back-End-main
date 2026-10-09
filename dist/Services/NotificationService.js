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
exports.NotificationService = void 0;
const Socket_1 = require("../Config/Socket");
const inversify_1 = require("inversify");
const CustomError_1 = require("../Utils/CustomError");
let NotificationService = class NotificationService {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async addNotification(userId, message) {
        try {
            const notification = await this.notificationRepository.create({ userId, message });
            Socket_1.io.to(userId).emit("newNotification", { notification });
            console.log(`Real-time: Notification sent to user ${userId}: ${message}`);
        }
        catch (error) {
            console.error("Failed to add notification:", error);
        }
    }
    async getUnreadNotifications(userId) {
        try {
            const notifications = await this.notificationRepository.findUnreadNotifications(userId);
            return notifications;
        }
        catch (error) {
            console.error("Failed to fetch unread notifications:", error);
            throw new CustomError_1.CustomError("Unable to fetch notifications", 500);
        }
    }
    async markNotificationAsRead(userId, notificationId) {
        try {
            const notification = await this.notificationRepository.findNotificationById(notificationId);
            if (!notification) {
                throw new CustomError_1.CustomError("Notification not found", 404);
            }
            if (notification.userId.toString() !== userId.toString()) {
                throw new CustomError_1.CustomError("Not authorized", 401);
            }
            notification.isRead = true;
            await this.notificationRepository.updateNotification(notification);
            Socket_1.io.to(userId).emit("updateNotifications", {
                type: "markAsRead",
                notificationId,
            });
            return "Notification marked as read";
        }
        catch (error) {
            console.error("Failed to mark notification as read:", error);
            throw error;
        }
    }
    async deleteAllNotifications(userId) {
        try {
            await this.notificationRepository.deleteAllNotificationsByUser(userId);
            Socket_1.io.to(userId).emit("updateNotifications", {
                type: "clearAll",
            });
        }
        catch (error) {
            console.error("Failed to delete notifications:", error);
            throw new CustomError_1.CustomError("Unable to clear notifications", 500);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("INotificationRepository")),
    __metadata("design:paramtypes", [Object])
], NotificationService);
//# sourceMappingURL=NotificationService.js.map