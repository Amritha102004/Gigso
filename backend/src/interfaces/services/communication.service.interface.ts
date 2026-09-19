import type { INotification } from "../notification.interface";
import type { IMessage } from "../message.interface";
import type { IGigAnnouncement } from "../announcement.interface";
import type { Types } from "mongoose";

export interface INotificationService {
  createNotification(
    userId: string | Types.ObjectId,
    title: string,
    message: string,
    type: string
  ): Promise<INotification>;
  getNotifications(userId: string): Promise<INotification[]>;
  markAsRead(userId: string, notificationId: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<void>;
}

export interface IMessageService {
  sendMessage(
    senderId: string,
    receiverId: string,
    message: string,
    attachments?: string[],
    gigId?: string
  ): Promise<IMessage>;
  getMessages(userA: string, userB: string): Promise<IMessage[]>;
  getChatRooms(userId: string): Promise<any[]>;
}

export interface IAnnouncementService {
  createAnnouncement(gigId: string, message: string, ownerId: string): Promise<IGigAnnouncement>;
  getAnnouncements(gigId: string, userId: string, userRole: string): Promise<IGigAnnouncement[]>;
}
