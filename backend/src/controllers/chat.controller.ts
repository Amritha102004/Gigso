import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { MessageService } from "../services/message.service";
import { HttpStatus } from "../utils/http-status.enum";
import { asyncHandler } from "../utils/asyncHandler";

export class ChatController {
  constructor(private _messageService: MessageService) {}

  public getChatRooms = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id.toString();
    const rooms = await this._messageService.getChatRooms(userId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Chat rooms fetched successfully",
      data: { rooms },
    });
  });

  public getMessages = asyncHandler(
    async (req: AuthRequest<{ counterpartyId: string }>, res: Response) => {
      const userId = req.user!._id.toString();
      const { counterpartyId } = req.params;
      const messages = await this._messageService.getMessages(userId, counterpartyId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Messages fetched successfully",
        data: { messages },
      });
    }
  );

  public sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const senderId = req.user!._id.toString();
    const { receiverId, message, attachments, gigId } = req.body;

    const newMessage = await this._messageService.sendMessage(
      senderId,
      receiverId,
      message,
      attachments,
      gigId
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Message sent successfully",
      data: { message: newMessage },
    });
  });
}
