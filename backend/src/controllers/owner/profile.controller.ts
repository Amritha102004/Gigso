import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { IOwnerProfileService } from "../../interfaces/services/owner/profile.service.interface";
import { HttpStatus } from "../../utils/http-status.enum";
import { MESSAGES } from "../../constants/messages";
import { ApiResponse } from "../../types/api-response.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { toUserResponse } from "../../mappers/user.mapper";

export class OwnerProfileController {
  constructor(private _profileService: IOwnerProfileService) {}

  public setupOwnerProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id.toString();
    const profileData = req.body;

    const { user, profile } = await this._profileService.setupOwnerProfile(userId, profileData);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.OWNER_PROFILE_SETUP,
      data: { user: toUserResponse(user), profile },
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getOwnerProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id.toString();
    const profile = await this._profileService.getOwnerProfile(userId);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.OWNER_PROFILE_FETCHED,
      data: { profile },
    };

    res.status(HttpStatus.OK).json(response);
  });
}
