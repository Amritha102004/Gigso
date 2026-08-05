import type { ReviewRepository } from "../repositories/review.repository";
import type { GigRepository } from "../repositories/gig.repository";
import type { GigApplicationRepository } from "../repositories/application.repository";
import type { IReview } from "../interfaces/review.interface";

export class ReviewService {
  constructor(
    private _reviewRepo: ReviewRepository,
    private _gigRepo: GigRepository,
    private _appRepo: GigApplicationRepository
  ) {}

  async submitReview(
    reviewerId: string,
    reviewedUserId: string,
    gigId: string,
    rating: number,
    comment: string
  ): Promise<IReview> {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const gig = await this._gigRepo.findById(gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    if (gig.status !== "completed") {
      throw new Error("You can only review completed gigs");
    }

    const isOwner = gig.ownerId.toString() === reviewerId;
    const isWorker = gig.ownerId.toString() === reviewedUserId;

    if (isOwner) {
      // Owner reviewing worker: verify worker has an accepted application for this gig
      const apps = await this._appRepo.findByGigIdAndWorkerId(gigId, reviewedUserId);
      const acceptedApp = apps.find((a) => a.status === "accepted");
      if (!acceptedApp) {
        throw new Error("Hired worker application not found for this gig");
      }
    } else {
      // Worker reviewing owner: verify worker is accepted
      const apps = await this._appRepo.findByGigIdAndWorkerId(gigId, reviewerId);
      const acceptedApp = apps.find((a) => a.status === "accepted");
      if (!acceptedApp) {
        throw new Error("You were not hired for this gig, cannot review owner");
      }
      if (gig.ownerId.toString() !== reviewedUserId) {
        throw new Error("Target reviewed user is not the owner of this gig");
      }
    }

    const existingReview = await this._reviewRepo.findSpecificReview(gigId, reviewerId, reviewedUserId);
    if (existingReview) {
      throw new Error("You have already reviewed this user for this gig");
    }

    return await this._reviewRepo.create({
      gigId: gigId as any,
      reviewerId: reviewerId as any,
      reviewedUserId: reviewedUserId as any,
      rating,
      comment: comment || "",
    } as any);
  }

  async getUserReviewSummary(userId: string): Promise<{ average: number; count: number }> {
    return await this._reviewRepo.getSummaryForUser(userId);
  }

  async getUserReviews(userId: string, page: number = 1, limit: number = 10): Promise<IReview[]> {
    return await this._reviewRepo.findByReviewedUserId(userId, page, limit);
  }

  async getHiredWorkersForGig(gigId: string, ownerId: string): Promise<any[]> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      throw new Error("Gig not found or unauthorized access");
    }

    const apps = await this._appRepo.findByGigId(gigId);
    const hiredApps = apps.filter((a) => a.status === "accepted");

    return hiredApps.map((app) => {
      const wUser = app.workerId as any;
      const role = app.roleId as any;
      return {
        id: wUser?._id?.toString() || wUser?.id?.toString() || app.workerId.toString(),
        name: wUser?.name || "Worker",
        profileImage: wUser?.profileImage || null,
        roleName: role?.roleName || "Staff",
      };
    });
  }
}
