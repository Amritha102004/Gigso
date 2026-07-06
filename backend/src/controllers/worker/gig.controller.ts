import type { Request, Response } from "express";
import type { IWorkerGigService } from "../../interfaces/services/worker/gig.service.interface";
import { HttpStatus } from "../../utils/http-status.enum";
import type { ApiResponse } from "../../types/api-response.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { toGigResponseDTO, toGigListItemDTO } from "../../mappers/gig.mapper";
import { toCategoryDTO } from "../../mappers/category.mapper";

export class WorkerGigController {
  constructor(private _gigService: IWorkerGigService) {}

  public browseGigs = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      search: req.query.search as string | undefined,
      categoryId: req.query.category as string | undefined,
      location: req.query.location as string | undefined,
      minPay: req.query.minPay ? Number(req.query.minPay) : undefined,
      date: req.query.date as string | undefined,
    };

    const gigs = await this._gigService.browseGigs(filters);

    const response: ApiResponse = {
      success: true,
      message: "Active gigs fetched successfully",
      data: gigs.map(toGigListItemDTO),
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getGigById = asyncHandler(async (req: Request, res: Response) => {
    const gigId = req.params.gigId as string;
    const gig = await this._gigService.getGigById(gigId);

    const response: ApiResponse = {
      success: true,
      message: "Gig details fetched successfully",
      data: toGigResponseDTO(gig),
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await this._gigService.getCategories();

    const response: ApiResponse = {
      success: true,
      message: "Categories fetched successfully",
      data: categories.map(toCategoryDTO),
    };

    res.status(HttpStatus.OK).json(response);
  });
}
