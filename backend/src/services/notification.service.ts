import type { NotificationRepository } from "../repositories/notification.repository";
import type { INotification } from "../interfaces/notification.interface";
import type { Types } from "mongoose";

export class NotificationService {
  constructor(private _notificationRepo: NotificationRepository) {}

  async createNotification(
    userId: string | Types.ObjectId,
    title: string,
    message: string,
    type: string
  ): Promise<INotification> {
    return await this._notificationRepo.create({
      userId: userId as any,
      title,
      message,
      type,
      isRead: false,
    } as INotification);
  }

  async getNotifications(userId: string): Promise<INotification[]> {
    return await this._notificationRepo.findAllForUser(userId);
  }

  async markAsRead(userId: string, notificationId: string): Promise<INotification | null> {
    const notification = await this._notificationRepo.findById(notificationId);
    if (!notification) {
      throw new Error("NOTIFICATION_NOT_FOUND");
    }
    if (notification.userId.toString() !== userId) {
      throw new Error("UNAUTHORIZED");
    }
    return await this._notificationRepo.update(notificationId, { isRead: true } as any);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this._notificationRepo.markAllAsRead(userId);
  }
}
