import mongoose, { Schema } from "mongoose";
import { ICategory } from "../interfaces/gig.interface";

const categorySchema: Schema<ICategory> = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, "Category icon is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);
