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
    await this._model.updateMany(
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
    return await this._model.findOne({ _id: id, isDeleted: false })
      .populate("categoryId")
      .populate("roles")
      .exec();
  }

  async findByOwnerId(ownerId: string, filters?: { status?: string }): Promise<IGig[]> {
    await this._updateExpiredGigs();
    const query: {
      ownerId: Types.ObjectId;
      isDeleted: boolean;
      status?: string;
    } = { ownerId: new Types.ObjectId(ownerId), isDeleted: false };
    if (filters?.status) {
      query.status = filters.status;
    }
    return await this._model.find(query)
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
    const query: {
      status: string;
      isDeleted: boolean;
      categoryId?: Types.ObjectId;
      location?: string | { $regex: string; $options: string };
      $or?: Array<{
        title?: { $regex: string; $options: string };
        location?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
      }>;
      eventDate?: { $gte: Date; $lte: Date };
    } = { status: "active", isDeleted: false };

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

    let gigs = await this._model.find(query)
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
    const result = await this._model.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).exec();
    return !!result;
  }

  async findAllGigs(
    filters: { search?: string; categoryId?: string; status?: string; date?: string },
    page: number,
    limit: number
  ): Promise<{ gigs: IGig[]; total: number }> {
    await this._updateExpiredGigs();
    const query: {
      isDeleted: boolean;
      categoryId?: Types.ObjectId;
      status?: string;
      $or?: Array<{ title?: { $regex: string; $options: string }; location?: { $regex: string; $options: string } }>;
      eventDate?: { $gte: Date; $lte: Date };
    } = { isDeleted: false };

    if (filters.categoryId) {
      query.categoryId = new Types.ObjectId(filters.categoryId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { location: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.date) {
      const dateStart = new Date(filters.date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(filters.date);
      dateEnd.setHours(23, 59, 59, 999);
      query.eventDate = { $gte: dateStart, $lte: dateEnd };
    }

    const skip = (page - 1) * limit;

    const gigs = await this._model.find(query)
      .populate("categoryId")
      .populate("ownerId", "name email profileImage")
      .populate("roles")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this._model.countDocuments(query).exec();

    return { gigs, total };
  }

  async findGigDetailsById(id: string): Promise<IGig | null> {
    await this._updateExpiredGigs();
    return await this._model.findOne({ _id: id, isDeleted: false })
      .populate("categoryId")
      .populate("ownerId", "name email role profileImage")
      .populate("roles")
      .exec();
  }
}
