import { injectable } from "inversify";
import { Notification, INotification } from "../Models/NotificationModel";
import { INotificationRepository } from "../Interface/INotification/IRepository";
import { BaseRepository } from "./Base/BaseRepository";

@injectable()
export class NotificationRepository
  extends BaseRepository<INotification>
  implements INotificationRepository
{
  private readonly notificationModel = Notification;

  constructor() {
    super(Notification);
  }

  public async create(data: any): Promise<any> {
    return await Notification.create(data);
  }

  async findUnreadNotifications(userId: string): Promise<INotification[]> {
    return Notification.find({ userId, isRead: false }).sort({ createdAt: -1 });
  }

  async findNotificationById(notificationId: string): Promise<INotification | null> {
    return Notification.findById(notificationId);
  }

  async updateNotification(notification: INotification): Promise<void> {
    await notification.save();
  }

  async deleteAllNotificationsByUser(userId: string): Promise<void> {
    await Notification.deleteMany({ userId });
  }
}