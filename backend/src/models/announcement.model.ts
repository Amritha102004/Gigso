import mongoose, { Schema } from "mongoose";
import type { IGigAnnouncement } from "../interfaces/announcement.interface";

const announcementSchema: Schema<IGigAnnouncement> = new Schema<IGigAnnouncement>(
  {
    gigId: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ gigId: 1, createdAt: -1 });

export const GigAnnouncementModel = mongoose.model<IGigAnnouncement>("GigAnnouncement", announcementSchema);
