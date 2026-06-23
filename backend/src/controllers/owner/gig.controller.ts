import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { IOwnerGigService } from "../../interfaces/services/owner/gig.service.interface";
import { HttpStatus } from "../../utils/http-status.enum";
import { MESSAGES } from "../../constants/messages";
import { ApiResponse } from "../../types/api-response.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { toGigResponseDTO, toGigListItemDTO } from "../../mappers/gig.mapper";
import { toCategoryDTO } from "../../mappers/category.mapper";

export class OwnerGigController {
  constructor(private _gigService: IOwnerGigService) {}

  public createGig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user._id.toString();
    const gig = await this._gigService.createGig(ownerId, req.body);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.GIG_CREATED,
      data: toGigResponseDTO(gig),
    };

    res.status(HttpStatus.CREATED).json(response);
  });

  public getMyGigs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user._id.toString();
    const status = req.query.status as string | undefined;
    const gigs = await this._gigService.getOwnerGigs(ownerId, status);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.GIGS_FETCHED,
      data: gigs.map(toGigListItemDTO),
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getGigById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user._id.toString();
    const gigId = req.params.gigId as string;
    const gig = await this._gigService.getGigById(gigId, ownerId);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.GIG_FETCHED,
      data: toGigResponseDTO(gig),
    };

    res.status(HttpStatus.OK).json(response);
  });

  public updateGig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user._id.toString();
    const gigId = req.params.gigId as string;
    const gig = await this._gigService.updateGig(gigId, ownerId, req.body);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.GIG_UPDATED,
      data: toGigResponseDTO(gig),
    };

    res.status(HttpStatus.OK).json(response);
  });

  public deleteGig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user._id.toString();
    const gigId = req.params.gigId as string;
    await this._gigService.softDeleteGig(gigId, ownerId);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.GIG_DELETED,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public publishGig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user._id.toString();
    const gigId = req.params.gigId as string;
    const gig = await this._gigService.publishGig(gigId, ownerId);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.GIG_PUBLISHED,
      data: toGigResponseDTO(gig),
    };

    res.status(HttpStatus.OK).json(response);
  });

  public markAsCompleted = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user._id.toString();
    const gigId = req.params.gigId as string;
    const gig = await this._gigService.markAsCompleted(gigId, ownerId);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.GIG_COMPLETED,
      data: toGigResponseDTO(gig),
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    const categories = await this._gigService.getCategories();

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.CATEGORIES_FETCHED,
      data: categories.map(toCategoryDTO),
    };

    res.status(HttpStatus.OK).json(response);
  });
}
