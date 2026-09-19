import type { IBaseRepository } from "./base.repository.interface";
import type { IReview } from "../review.interface";

export interface IReviewRepository extends IBaseRepository<IReview> {
  findByReviewedUserId(reviewedUserId: string, page: number, limit: number): Promise<IReview[]>;
  getSummaryForUser(reviewedUserId: string): Promise<{ average: number; count: number }>;
  findSpecificReview(gigId: string, reviewerId: string, reviewedUserId: string): Promise<IReview | null>;
}
