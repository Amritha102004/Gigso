import type { Request, Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import type { IWorkerGigService } from "../../interfaces/services/worker/gig.service.interface";
import { HttpStatus } from "../../utils/http-status.enum";
import type { ApiResponse } from "../../types/api-response.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { toBrowseGigsQueryDTO } from "../../mappers/request.mapper";

export class WorkerGigController {
  constructor(private _gigService: IWorkerGigService) {}

  public browseGigs = asyncHandler(async (req: Request, res: Response) => {
    const dto = toBrowseGigsQueryDTO(req.query);
    const gigs = await this._gigService.browseGigs(dto);

    const response: ApiResponse = {
      success: true,
      message: "Active gigs fetched successfully",
      data: gigs,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getGigById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const gigId = req.params.gigId as string;
    const workerId = req.user?._id.toString();
    const gig = await this._gigService.getGigById(gigId, workerId);

    const response: ApiResponse = {
      success: true,
      message: "Gig details fetched successfully",
      data: gig,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    const categories = await this._gigService.getCategories();

    const response: ApiResponse = {
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = req.user!._id.toString();
    const range = (req.query.range as string) || "30";
    const stats = await this._gigService.getWorkerDashboardStats(workerId, range);

    const response: ApiResponse = {
      success: true,
      message: "Worker dashboard statistics fetched successfully",
      data: stats,
    };

    res.status(HttpStatus.OK).json(response);
  });
}
