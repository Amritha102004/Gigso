import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { IApplicationService } from "../interfaces/services/application.service.interface";
import { HttpStatus } from "../utils/http-status.enum";
import type { ApiResponse } from "../types/api-response.type";
import { asyncHandler } from "../utils/asyncHandler";
import { toApplyForGigRoleRequestDTO, toUpdateApplicationStatusRequestDTO } from "../mappers/request.mapper";

export class ApplicationController {
  constructor(private _applicationService: IApplicationService) {}

  public applyForGigRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = req.user!._id.toString();
    const gigId = req.params.gigId as string;
    const dto = toApplyForGigRoleRequestDTO(req.body);

    if (!dto.roleId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "roleId is required in request body",
      });
      return;
    }

    const application = await this._applicationService.applyForGigRole(workerId, gigId, dto.roleId);

    const response: ApiResponse = {
      success: true,
      message: "Applied for role successfully",
      data: application,
    };

    res.status(HttpStatus.CREATED).json(response);
  });

  public getWorkerApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = req.user!._id.toString();
    const status = req.query.status as string | undefined;

    const applications = await this._applicationService.getWorkerApplications(workerId, status);

    const response: ApiResponse = {
      success: true,
      message: "Applications fetched successfully",
      data: applications,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getGigApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!._id.toString();
    const gigId = req.params.gigId as string;

    const applications = await this._applicationService.getGigApplications(gigId, ownerId);

    const response: ApiResponse = {
      success: true,
      message: "Gig applications fetched successfully",
      data: applications,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public updateApplicationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!._id.toString();
    const applicationId = req.params.applicationId as string;
    const dto = toUpdateApplicationStatusRequestDTO(req.body);

    if (dto.status !== "accepted" && dto.status !== "rejected") {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Status must be either 'accepted' or 'rejected'",
      });
      return;
    }

    const application = await this._applicationService.updateApplicationStatus(applicationId, ownerId, dto.status);

    const response: ApiResponse = {
      success: true,
      message: `Application status updated to ${dto.status}`,
      data: application,
    };

    res.status(HttpStatus.OK).json(response);
  });

  public withdrawApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = req.user!._id.toString();
    const applicationId = req.params.applicationId as string;

    await this._applicationService.withdrawApplication(applicationId, workerId);

    const response: ApiResponse = {
      success: true,
      message: "Application withdrawn successfully",
    };

    res.status(HttpStatus.OK).json(response);
  });
}
