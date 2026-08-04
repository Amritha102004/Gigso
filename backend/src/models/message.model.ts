import mongoose, { Schema } from "mongoose";
import type { IMessage } from "../interfaces/message.interface";

const messageSchema: Schema<IMessage> = new Schema<IMessage>(
  {
    gigId: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ gigId: 1, senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: 1 });

export const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
