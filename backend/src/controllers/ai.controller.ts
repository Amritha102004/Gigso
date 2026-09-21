import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { IAIService } from "../interfaces/services/ai.service.interface";
import { HttpStatus } from "../utils/http-status.enum";
import { asyncHandler } from "../utils/asyncHandler";

export class AIController {
  constructor(private _aiService: IAIService) {}

  public matchApplicants = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { gig, applicants } = req.body;

    if (!gig || !applicants || !Array.isArray(applicants)) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Gig information and applicants list are required",
      });
      return;
    }

    const matches = await this._aiService.matchApplicants(gig, applicants);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Applicant match scores generated successfully",
      data: matches,
    });
  });
}
