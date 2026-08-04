import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { AnnouncementService } from "../services/announcement.service";
import { HttpStatus } from "../utils/http-status.enum";
import { asyncHandler } from "../utils/asyncHandler";

export class AnnouncementController {
  constructor(private _announcementService: AnnouncementService) {}

  public getAnnouncements = asyncHandler(async (req: AuthRequest<{ gigId: string }>, res: Response) => {
    const userId = req.user!._id.toString();
    const role = req.user!.role;
    const { gigId } = req.params;

    const announcements = await this._announcementService.getAnnouncements(gigId, userId, role);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Announcements fetched successfully",
      data: { announcements },
    });
  });

  public createAnnouncement = asyncHandler(async (req: AuthRequest<{ gigId: string }>, res: Response) => {
    const ownerId = req.user!._id.toString();
    const { gigId } = req.params;
    const { message } = req.body;

    const announcement = await this._announcementService.createAnnouncement(gigId, message, ownerId);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Announcement created successfully",
      data: { announcement },
    });
  });
}
