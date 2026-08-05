import mongoose, { Schema } from "mongoose";
import type { IReview } from "../interfaces/review.interface";

const reviewSchema = new Schema<IReview>(
  {
    gigId: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: [true, "Gig ID is required"],
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer ID is required"],
    },
    reviewedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewed User ID is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
reviewSchema.index({ reviewedUserId: 1 });
reviewSchema.index({ reviewerId: 1 });

// Prevent a reviewer from rating the same person for the same gig multiple times
reviewSchema.index({ gigId: 1, reviewerId: 1, reviewedUserId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReview>("Review", reviewSchema);
