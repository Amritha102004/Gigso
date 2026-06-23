import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { IWorkerProfileService } from "../../interfaces/services/worker/profile.service.interface";
import { HttpStatus } from "../../utils/http-status.enum";
import { MESSAGES } from "../../constants/messages";
import { ApiResponse } from "../../types/api-response.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { toUserResponse } from "../../mappers/user.mapper";

export class WorkerProfileController {
  constructor(private _profileService: IWorkerProfileService) {}

  public setupWorkerProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id.toString();
    const profileData = req.body;

    const { user, profile } = await this._profileService.setupWorkerProfile(userId, profileData);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.WORKER_PROFILE_SETUP,
      data: { user: toUserResponse(user), profile },
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getWorkerProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id.toString();
    const profile = await this._profileService.getWorkerProfile(userId);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.WORKER_PROFILE_FETCHED,
      data: { profile },
    };

    res.status(HttpStatus.OK).json(response);
  });
}
