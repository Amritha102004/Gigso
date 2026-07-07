import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { IApplicationService } from "../interfaces/services/application.service.interface";
import { HttpStatus } from "../utils/http-status.enum";
import type { ApiResponse } from "../types/api-response.type";
import { asyncHandler } from "../utils/asyncHandler";
import { toGigApplicationDTO } from "../mappers/application.mapper";

export class ApplicationController {
  constructor(private _applicationService: IApplicationService) {}

  public applyForGigRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = req.user._id.toString();
    const gigId = req.params.gigId as string;
    const { roleId } = req.body;

    if (!roleId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "roleId is required in request body",
      });
      return;
    }

    const application = await this._applicationService.applyForGigRole(workerId, gigId, roleId);

    const response: ApiResponse = {
      success: true,
      message: "Applied for role successfully",
      data: toGigApplicationDTO(application),
    };

    res.status(HttpStatus.CREATED).json(response);
  });

  public getWorkerApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = req.user._id.toString();
    const status = req.query.status as string | undefined;

    const applications = await this._applicationService.getWorkerApplications(workerId, status);

    const response: ApiResponse = {
      success: true,
      message: "Applications fetched successfully",
      data: applications.map((app) => toGigApplicationDTO(app)),
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getGigApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user._id.toString();
    const gigId = req.params.gigId as string;

    const applicationsWithProfiles = await this._applicationService.getGigApplications(gigId, ownerId);

    const response: ApiResponse = {
      success: true,
      message: "Gig applications fetched successfully",
      data: applicationsWithProfiles.map(({ application, profile }) => 
        toGigApplicationDTO(application, profile)
      ),
    };

    res.status(HttpStatus.OK).json(response);
  });

  public updateApplicationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user._id.toString();
    const applicationId = req.params.applicationId as string;
    const { status } = req.body;

    if (status !== "accepted" && status !== "rejected") {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Status must be either 'accepted' or 'rejected'",
      });
      return;
    }

    const application = await this._applicationService.updateApplicationStatus(applicationId, ownerId, status);

    const response: ApiResponse = {
      success: true,
      message: `Application status updated to ${status}`,
      data: toGigApplicationDTO(application),
    };

    res.status(HttpStatus.OK).json(response);
  });

  public withdrawApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = req.user._id.toString();
    const applicationId = req.params.applicationId as string;

    await this._applicationService.withdrawApplication(applicationId, workerId);

    const response: ApiResponse = {
      success: true,
      message: "Application withdrawn successfully",
    };

    res.status(HttpStatus.OK).json(response);
  });
}
