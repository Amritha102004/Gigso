import { NotificationModel } from "../models/notification.model";
import type { INotification } from "../interfaces/notification.interface";
import { BaseRepository } from "./base.repository";

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(NotificationModel);
  }

  async findAllForUser(userId: string): Promise<INotification[]> {
    return await this._model.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this._model.updateMany({ userId, isRead: false }, { isRead: true }).exec();
  }
}
