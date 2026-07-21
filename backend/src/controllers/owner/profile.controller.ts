import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import type { IOwnerProfileService } from "../../interfaces/services/owner/profile.service.interface";
import { HttpStatus } from "../../utils/http-status.enum";
import { MESSAGES } from "../../constants/messages";
import type { ApiResponse } from "../../types/api-response.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { toSetupOwnerProfileRequestDTO } from "../../mappers/request.mapper";

export class OwnerProfileController {
  constructor(private _profileService: IOwnerProfileService) {}

  public setupOwnerProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user._id.toString();
    const dto = toSetupOwnerProfileRequestDTO(req.body);

    const { user, profile } = await this._profileService.setupOwnerProfile(userId, dto);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.OWNER_PROFILE_SETUP,
      data: { user, profile },
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
