import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { NotificationService } from "../services/notification.service";
import { HttpStatus } from "../utils/http-status.enum";
import { asyncHandler } from "../utils/asyncHandler";

export class NotificationController {
  constructor(private _notificationService: NotificationService) {}

  public getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id.toString();
    const notifications = await this._notificationService.getNotifications(userId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Notifications fetched successfully",
      data: { notifications },
    });
  });

  public markAsRead = asyncHandler(async (req: AuthRequest<{ id: string }>, res: Response) => {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const notification = await this._notificationService.markAsRead(userId, id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Notification marked as read",
      data: { notification },
    });
  });

  public markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id.toString();
    await this._notificationService.markAllAsRead(userId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "All notifications marked as read",
    });
  });
}
