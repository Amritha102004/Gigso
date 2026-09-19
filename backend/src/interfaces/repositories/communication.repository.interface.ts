import type { IBaseRepository } from "./base.repository.interface";
import type { INotification } from "../notification.interface";
import type { IMessage } from "../message.interface";
import type { IGigAnnouncement } from "../announcement.interface";

export interface INotificationRepository extends IBaseRepository<INotification> {
  findAllForUser(userId: string): Promise<INotification[]>;
  markAllAsRead(userId: string): Promise<void>;
}

export interface IMessageRepository extends IBaseRepository<IMessage> {
  findMessagesBetween(userA: string, userB: string): Promise<IMessage[]>;
  findChatRoomsForUser(userId: string): Promise<any[]>;
  markAsRead(senderId: string, receiverId: string): Promise<void>;
}

export interface IAnnouncementRepository extends IBaseRepository<IGigAnnouncement> {
  findAllForGig(gigId: string): Promise<IGigAnnouncement[]>;
}
