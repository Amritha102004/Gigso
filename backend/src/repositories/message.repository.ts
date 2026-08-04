import mongoose from "mongoose";
import { MessageModel } from "../models/message.model";
import type { IMessage } from "../interfaces/message.interface";
import { BaseRepository } from "./base.repository";

export class MessageRepository extends BaseRepository<IMessage> {
  constructor() {
    super(MessageModel);
  }

  async findMessagesBetween(userA: string, userB: string): Promise<IMessage[]> {
    const objectA = new mongoose.Types.ObjectId(userA);
    const objectB = new mongoose.Types.ObjectId(userB);
    return await this._model.find({
      $or: [
        { senderId: objectA, receiverId: objectB },
        { senderId: objectB, receiverId: objectA }
      ]
    }).sort({ createdAt: 1 }).exec();
  }

  async markAsRead(senderId: string, receiverId: string): Promise<void> {
    const objectSender = new mongoose.Types.ObjectId(senderId);
    const objectReceiver = new mongoose.Types.ObjectId(receiverId);
    await this._model.updateMany({
      senderId: objectSender,
      receiverId: objectReceiver,
      isRead: false
    }, { isRead: true }).exec();
  }

  async findChatRoomsForUser(userId: string): Promise<any[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await this._model.aggregate([
      {
        $match: {
          $or: [
            { senderId: userObjectId },
            { receiverId: userObjectId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            conversationId: {
              $cond: [
                { $gt: [ { $toString: "$senderId" }, { $toString: "$receiverId" } ] },
                { senderId: "$senderId", receiverId: "$receiverId" },
                { senderId: "$receiverId", receiverId: "$senderId" }
              ]
            }
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: [ "$receiverId", userObjectId ] },
                    { $eq: [ "$isRead", false ] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]).exec();
  }
}
