import mongoose from "mongoose";
import { GigAnnouncementModel } from "../models/announcement.model";
import type { IGigAnnouncement } from "../interfaces/announcement.interface";
import { BaseRepository } from "./base.repository";

export class AnnouncementRepository extends BaseRepository<IGigAnnouncement> {
  constructor() {
    super(GigAnnouncementModel);
  }

  async findAllForGig(gigId: string): Promise<IGigAnnouncement[]> {
    const gigObjectId = new mongoose.Types.ObjectId(gigId);
    return await this._model.find({ gigId: gigObjectId }).sort({ createdAt: -1 }).exec();
  }
}
