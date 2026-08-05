import { ReviewModel } from "../models/review.model";
import type { IReview } from "../interfaces/review.interface";
import { BaseRepository } from "./base.repository";
import { Types } from "mongoose";

export class ReviewRepository extends BaseRepository<IReview> {
  constructor() {
    super(ReviewModel);
  }

  async findByReviewedUserId(reviewedUserId: string, page: number, limit: number): Promise<IReview[]> {
    return await this._model.find({ reviewedUserId: new Types.ObjectId(reviewedUserId) })
      .populate("reviewerId", "name profileImage role")
      .populate("gigId", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async getSummaryForUser(reviewedUserId: string): Promise<{ average: number; count: number }> {
    const result = await this._model.aggregate([
      { $match: { reviewedUserId: new Types.ObjectId(reviewedUserId) } },
      {
        $group: {
          _id: "$reviewedUserId",
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]).exec();

    if (result.length > 0) {
      return {
        average: parseFloat(result[0].average.toFixed(1)),
        count: result[0].count,
      };
    }
    return { average: 0, count: 0 };
  }

  async findSpecificReview(gigId: string, reviewerId: string, reviewedUserId: string): Promise<IReview | null> {
    return await this._model.findOne({
      gigId: new Types.ObjectId(gigId),
      reviewerId: new Types.ObjectId(reviewerId),
      reviewedUserId: new Types.ObjectId(reviewedUserId)
    }).exec();
  }
}
