import asyncHandler from "express-async-handler";
import { Response } from "express";
import { CustomRequest } from "../Middlewares/AuthMiddleware";
import { inject, injectable } from "inversify";
import { INotificationService } from "../Interface/INotification/IService";

@injectable()
export class NotificationController {
  constructor(
    @inject("INotificationService") private readonly notificationService: INotificationService
  ) {}

  getUnreadNotifications = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const userId = req.user?._id;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      try {
        const notifications = await this.notificationService.getUnreadNotifications(userId);
        res.json(notifications);
      } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
      }
    }
  );

  markNotificationAsRead = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id: notificationId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      try {
        const message = await this.notificationService.markNotificationAsRead(userId, notificationId);
        res.json({ message });
      } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
      }
    }
  );

  clearNotifications = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const userId = req.user?._id;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      try {
        await this.notificationService.deleteAllNotifications(userId);
        res.json({ message: "All notifications cleared" });
      } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
      }
    }
  );
}
