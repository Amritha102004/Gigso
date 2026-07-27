import type { Request, Response } from "express";
import type { IAdminGigService } from "../../interfaces/services/admin/gig.service.interface";
import { HttpStatus } from "../../utils/http-status.enum";
import type { ApiResponse } from "../../types/api-response.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { toAdminGigsQueryDTO, toUpdateApplicationStatusRequestDTO } from "../../mappers/request.mapper";

export class AdminGigController {
  constructor(private _gigService: IAdminGigService) {}

  public getAllGigs = asyncHandler(async (req: Request, res: Response) => {
    const dto = toAdminGigsQueryDTO(req.query);

    const result = await this._gigService.getAllGigs(dto, dto.page || 1, dto.limit || 10);

    const response: ApiResponse = {
      success: true,
      message: "Gigs fetched successfully",
      data: result,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getGigById = asyncHandler(async (req: Request<{ gigId: string }>, res: Response) => {
    const { gigId } = req.params;
    const result = await this._gigService.getGigById(gigId);

    const response: ApiResponse = {
      success: true,
      message: "Gig details fetched successfully",
      data: result,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public toggleFlagGig = asyncHandler(async (req: Request<{ gigId: string }>, res: Response) => {
    const { gigId } = req.params;
    const { isFlagged } = req.body;

    const result = await this._gigService.toggleFlagGig(gigId, !!isFlagged);

    const response: ApiResponse = {
      success: true,
      message: `Gig ${isFlagged ? "flagged for review" : "unflagged"} successfully`,
      data: result,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public deleteGig = asyncHandler(async (req: Request<{ gigId: string }>, res: Response) => {
    const { gigId } = req.params;
    await this._gigService.deleteGig(gigId);

    const response: ApiResponse = {
      success: true,
      message: "Gig deleted successfully",
    };

    res.status(HttpStatus.OK).json(response);
  });

  public updateApplicationStatus = asyncHandler(async (req: Request<{ gigId: string; appId: string }>, res: Response) => {
    const { gigId, appId } = req.params;
    const dto = toUpdateApplicationStatusRequestDTO(req.body);

    if (dto.status !== "accepted" && dto.status !== "rejected") {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid status value. Must be 'accepted' or 'rejected'",
      });
      return;
    }

    const result = await this._gigService.updateApplicationStatus(gigId, appId, dto.status);

    const response: ApiResponse = {
      success: true,
      message: `Application ${dto.status === 'accepted' ? 'approved' : 'rejected'} successfully`,
      data: result,
    };

    res.status(HttpStatus.OK).json(response);
  });
}
