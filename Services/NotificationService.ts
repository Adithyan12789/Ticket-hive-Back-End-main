import { io } from "../Config/Socket";
import { INotificationRepository } from "../Interface/INotification/IRepository";
import { inject, injectable } from "inversify";
import { INotificationService } from "../Interface/INotification/IService";
import { CustomError } from "../Utils/CustomError";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject("INotificationRepository") private readonly notificationRepository: INotificationRepository
  ) {}

  async addNotification(userId: string, message: string): Promise<void> {
    try {
      const notification = await this.notificationRepository.create({ userId, message });
      io.to(userId).emit("newNotification", { notification });
      console.log(`Real-time: Notification sent to user ${userId}: ${message}`);
    } catch (error) {
      console.error("Failed to add notification:", error);
    }
  }

  async getUnreadNotifications(userId: string): Promise<any> {
    try {
      const notifications = await this.notificationRepository.findUnreadNotifications(userId);
      return notifications;
    } catch (error) {
      console.error("Failed to fetch unread notifications:", error);
      throw new CustomError("Unable to fetch notifications", 500);
    }
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<string> {
    try {
      const notification = await this.notificationRepository.findNotificationById(notificationId);
      if (!notification) {
        throw new CustomError("Notification not found", 404);
      }

      if (notification.userId.toString() !== userId.toString()) {
        throw new CustomError("Not authorized", 401);
      }

      notification.isRead = true;
      await this.notificationRepository.updateNotification(notification);

      io.to(userId).emit("updateNotifications", {
        type: "markAsRead",
        notificationId,
      });

      return "Notification marked as read";
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      await this.notificationRepository.deleteAllNotificationsByUser(userId);
      io.to(userId).emit("updateNotifications", {
        type: "clearAll",
      });
    } catch (error) {
      console.error("Failed to delete notifications:", error);
      throw new CustomError("Unable to clear notifications", 500);
    }
  }
}
