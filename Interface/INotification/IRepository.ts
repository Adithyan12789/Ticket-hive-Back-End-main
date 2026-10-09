// config / IRepository.ts

import { INotification } from "../../Models/NotificationModel";

export interface INotificationRepository {
  create(data: any): Promise<any>;
  findUnreadNotifications(userId: string): Promise<INotification[]>;
  findNotificationById(notificationId: string): Promise<INotification | null>;
  updateNotification(notification: INotification): Promise<void>;
  deleteAllNotificationsByUser(userId: string): Promise<void>;
}