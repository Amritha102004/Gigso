import type { IReview } from "../review.interface";

export interface IReviewService {
  submitReview(
    reviewerId: string,
    reviewedUserId: string,
    gigId: string,
    rating: number,
    comment: string
  ): Promise<IReview>;
  getUserReviewSummary(userId: string): Promise<{ average: number; count: number }>;
  getUserReviews(userId: string, page?: number, limit?: number): Promise<IReview[]>;
  getHiredWorkersForGig(gigId: string, ownerId: string): Promise<any[]>;
}
