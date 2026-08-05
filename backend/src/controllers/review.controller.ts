import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import type { ReviewService } from "../services/review.service";
import { HttpStatus } from "../utils/http-status.enum";
import { asyncHandler } from "../utils/asyncHandler";

export class ReviewController {
  constructor(private _reviewService: ReviewService) {}

  public submitReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reviewerId = req.user!._id.toString();
    const { reviewedUserId, gigId, rating, comment } = req.body;

    if (!reviewedUserId || !gigId || rating === undefined) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "reviewedUserId, gigId, and rating are required fields",
      });
      return;
    }

    const review = await this._reviewService.submitReview(
      reviewerId,
      reviewedUserId,
      gigId,
      Number(rating),
      comment || ""
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Review submitted successfully",
      data: { review },
    });
  });

  public getUserReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!userId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "userId parameter is required",
      });
      return;
    }

    const reviews = await this._reviewService.getUserReviews(userId, page, limit);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "User reviews fetched successfully",
      data: { reviews },
    });
  });

  public getUserSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "userId parameter is required",
      });
      return;
    }

    const summary = await this._reviewService.getUserReviewSummary(userId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "User review summary fetched successfully",
      data: { summary },
    });
  });

  public getHiredWorkers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!._id.toString();
    const { gigId } = req.params;

    if (!gigId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "gigId parameter is required",
      });
      return;
    }

    const workers = await this._reviewService.getHiredWorkersForGig(gigId, ownerId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Hired workers fetched successfully",
      data: { workers },
    });
  });
}
