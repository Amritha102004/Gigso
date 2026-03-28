import mongoose, { Schema } from "mongoose";
import { IWorkerProfile } from "../interfaces/user.interface";

const workerProfileSchema: Schema<IWorkerProfile> =
  new Schema<IWorkerProfile>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      skills: {
        type: [String],
        default: [],
      },

      portfolio: {
        type: [String],
        default: [],
      },

      age: Number,

      bio: String,

      location: String,
    },
    {
      timestamps: true,
    }
  );

export const WorkerProfileModel = mongoose.model<IWorkerProfile>(
  "WorkerProfile",
  workerProfileSchema
);