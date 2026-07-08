import type { Request, Response } from "express";
import type { IAdminGigService } from "../../interfaces/services/admin/gig.service.interface";
import { HttpStatus } from "../../utils/http-status.enum";
import type { ApiResponse } from "../../types/api-response.type";
import { asyncHandler } from "../../utils/asyncHandler";

export class AdminGigController {
  constructor(private _gigService: IAdminGigService) {}

  public getAllGigs = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const status = req.query.status as string | undefined;
    const date = req.query.date as string | undefined;

    const filters = { search, categoryId, status, date };
    const result = await this._gigService.getAllGigs(filters, page, limit);

    const response: ApiResponse = {
      success: true,
      message: "Gigs fetched successfully",
      data: result,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getGigById = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const result = await this._gigService.getGigById(id);

    const response: ApiResponse = {
      success: true,
      message: "Gig details fetched successfully",
      data: result,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public toggleFlagGig = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const { isFlagged } = req.body;

    const result = await this._gigService.toggleFlagGig(id, !!isFlagged);

    const response: ApiResponse = {
      success: true,
      message: `Gig ${isFlagged ? "flagged for review" : "unflagged"} successfully`,
      data: result,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public deleteGig = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    await this._gigService.deleteGig(id);

    const response: ApiResponse = {
      success: true,
      message: "Gig deleted successfully",
    };

    res.status(HttpStatus.OK).json(response);
  });

  public updateApplicationStatus = asyncHandler(async (req: Request<{ id: string; appId: string }>, res: Response) => {
    const { id, appId } = req.params;
    const { status } = req.body;

    if (status !== "accepted" && status !== "rejected") {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid status value. Must be 'accepted' or 'rejected'",
      });
      return;
    }

    const result = await this._gigService.updateApplicationStatus(id, appId, status);

    const response: ApiResponse = {
      success: true,
      message: `Application ${status === 'accepted' ? 'approved' : 'rejected'} successfully`,
      data: result,
    };

    res.status(HttpStatus.OK).json(response);
  });
}
