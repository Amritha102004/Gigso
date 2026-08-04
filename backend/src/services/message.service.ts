import type { MessageRepository } from "../repositories/message.repository";
import type { GigRepository } from "../repositories/gig.repository";
import type { UserRepository } from "../repositories/user.repository";
import type { NotificationService } from "./notification.service";
import type { IMessage } from "../interfaces/message.interface";
import type { Types } from "mongoose";

export class MessageService {
  constructor(
    private _messageRepo: MessageRepository,
    private _gigRepo: GigRepository,
    private _userRepo: UserRepository,
    private _notificationService: NotificationService
  ) {}

  async sendMessage(
    senderId: string,
    receiverId: string,
    message: string,
    attachments?: string[],
    gigId?: string
  ): Promise<IMessage> {
    const newMessage = await this._messageRepo.create({
      gigId: gigId as any,
      senderId: senderId as any,
      receiverId: receiverId as any,
      message,
      attachments: attachments || [],
      isRead: false,
    } as IMessage);

    // Trigger in-app notification for the receiver
    const sender = await this._userRepo.findById(senderId);
    const senderName = sender ? sender.name : "Someone";
    await this._notificationService.createNotification(
      receiverId,
      `New Message from ${senderName}`,
      message.length > 60 ? `${message.substring(0, 57)}...` : message,
      "new_message"
    );

    return newMessage;
  }

  async getMessages(userA: string, userB: string): Promise<IMessage[]> {
    // Mark messages sent by userB to userA as read
    await this._messageRepo.markAsRead(userB, userA);
    return await this._messageRepo.findMessagesBetween(userA, userB);
  }

  async getChatRooms(userId: string): Promise<any[]> {
    const rooms = await this._messageRepo.findChatRoomsForUser(userId);
    const populatedRooms = [];

    for (const room of rooms) {
      const senderStr = room._id.conversationId.senderId.toString();
      const receiverStr = room._id.conversationId.receiverId.toString();
      const counterpartyId = senderStr === userId ? receiverStr : senderStr;

      const counterparty = await this._userRepo.findById(counterpartyId);

      if (counterparty) {
        populatedRooms.push({
          counterpartyId,
          counterpartyName: counterparty.name,
          counterpartyRole: counterparty.role,
          lastMessage: room.lastMessage.message,
          lastMessageAt: room.lastMessage.createdAt.toISOString(),
          unreadCount: room.unreadCount,
        });
      }
    }

    return populatedRooms;
  }
}
