import { Request, Response } from "express";
import { IProfileService } from "../interfaces/services/profile.service.interface";
import { HttpStatus } from "../utils/http-status.enum";
import { MESSAGES } from "../constants/messages";
import { ApiResponse } from "../types/api-response.type";
import { asyncHandler } from "../utils/asyncHandler";
import { toUserResponse } from "../mappers/user.mapper";

export class ProfileController {
  constructor(private _profileService: IProfileService) {}

  public setupWorkerProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id.toString();
    const profileData = req.body;

    const { user, profile } = await this._profileService.setupWorkerProfile(userId, profileData);

    const response: ApiResponse = {
      success: true,
      message: "Worker profile setup successfully",
      data: { user: toUserResponse(user), profile }
    };

    res.status(HttpStatus.OK).json(response);
  });

  public setupOwnerProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id.toString();
    const profileData = req.body;

    const { user, profile } = await this._profileService.setupOwnerProfile(userId, profileData);

    const response: ApiResponse = {
      success: true,
      message: "Owner profile setup successfully",
      data: { user: toUserResponse(user), profile }
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getWorkerProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id.toString();
    const profile = await this._profileService.getWorkerProfile(userId);

    const response: ApiResponse = {
      success: true,
      message: "Worker profile fetched successfully",
      data: { profile }
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getOwnerProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id.toString();
    const profile = await this._profileService.getOwnerProfile(userId);

    const response: ApiResponse = {
      success: true,
      message: "Owner profile fetched successfully",
      data: { profile }
    };

    res.status(HttpStatus.OK).json(response);
  });
}
