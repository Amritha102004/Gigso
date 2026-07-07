import { Types } from "mongoose";
import { GigModel } from "../models/gig.model";
import type { IGig, IGigRole } from "../interfaces/gig.interface";
import type { IGigRepository } from "../interfaces/repositories/gig.repository.interface";
import { BaseRepository } from "./base.repository";

export class GigRepository extends BaseRepository<IGig> implements IGigRepository {
  constructor() {
    super(GigModel);
  }

  private async _updateExpiredGigs(): Promise<void> {
    const now = new Date();
    await GigModel.updateMany(
      {
        status: "active",
        eventDate: { $lt: now },
        isDeleted: false
      },
      { status: "completed" }
    ).exec();
  }

  override async findById(id: string): Promise<IGig | null> {
    await this._updateExpiredGigs();
    return await GigModel.findOne({ _id: id, isDeleted: false })
      .populate("categoryId")
      .populate("roles")
      .exec();
  }

  async findByOwnerId(ownerId: string, filters?: { status?: string }): Promise<IGig[]> {
    await this._updateExpiredGigs();
    const query: any = { ownerId, isDeleted: false };
    if (filters?.status) {
      query.status = filters.status;
    }
    return await GigModel.find(query)
      .populate("categoryId")
      .populate("roles")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActiveGigs(filters?: {
    search?: string;
    categoryId?: string;
    location?: string;
    minPay?: number;
    date?: string;
  }): Promise<IGig[]> {
    await this._updateExpiredGigs();
    const query: any = { status: "active", isDeleted: false };

    if (filters?.categoryId) {
      query.categoryId = new Types.ObjectId(filters.categoryId);
    }

    if (filters?.location) {
      query.location = { $regex: filters.location, $options: "i" };
    }

    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters?.date) {
      const dateStart = new Date(filters.date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(filters.date);
      dateEnd.setHours(23, 59, 59, 999);
      query.eventDate = { $gte: dateStart, $lte: dateEnd };
    }

    let gigs = await GigModel.find(query)
      .populate("categoryId")
      .populate("roles")
      .sort({ eventDate: 1 })
      .exec();

    if (filters?.minPay) {
      const minPayVal = Number(filters.minPay);
      gigs = gigs.filter((gig) => {
        const roles = (gig.roles || []) as any[] as IGigRole[];
        return roles.some((role) => role.payPerPerson >= minPayVal);
      });
    }

    return gigs;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await GigModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).exec();
    return !!result;
  }
}
