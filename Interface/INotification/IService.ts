// config / IService.ts

export interface INotificationService {
    addNotification(userId: string, message: string): Promise<void>;
    getUnreadNotifications(userId: string): Promise<any>;
    markNotificationAsRead(userId: string, notificationId: string): Promise<string>;
    deleteAllNotifications(userId: string): Promise<void>;
}
