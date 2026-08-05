import { Types } from "mongoose";
import { GigModel } from "../models/gig.model";
import type { IGig, IGigRole } from "../interfaces/gig.interface";
import type { IGigRepository } from "../interfaces/repositories/gig.repository.interface";
import { BaseRepository } from "./base.repository";
import { GigApplicationModel } from "../models/application.model";
import { NotificationModel } from "../models/notification.model";

export class GigRepository extends BaseRepository<IGig> implements IGigRepository {
  constructor() {
    super(GigModel);
  }

  private async _syncGigStates(): Promise<void> {
    const now = new Date();
    const gigs = await this._model.find({
      status: { $in: ["active", "closed"] },
      isDeleted: false,
    }).populate("roles").exec();

    for (const gig of gigs) {
      try {
        const eventStart = new Date(gig.eventDate);
        const match = gig.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const ampm = match[3];
          if (ampm) {
            if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
            if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
          }
          eventStart.setHours(hours, minutes, 0, 0);
        }

        const msDiff = eventStart.getTime() - Date.now();
        const hoursLeft = msDiff / (1000 * 60 * 60);

        const acceptedCount = await GigApplicationModel.countDocuments({
          gigId: gig._id,
          status: "accepted",
        });

        let totalSpots = 0;
        if (gig.roles && gig.roles.length > 0) {
          for (const role of gig.roles as any[]) {
            totalSpots += role.spots || 0;
          }
        }

        let newStatus: string | null = null;

        if (hoursLeft <= 0) {
          if (acceptedCount > 0) {
            newStatus = "completed";
          } else {
            newStatus = "cancelled";
          }
        } else if (hoursLeft <= 5) {
          if (acceptedCount > 0) {
            newStatus = "closed";
          } else {
            newStatus = "cancelled";
          }
        } else {
          if (gig.status === "active" && totalSpots > 0 && acceptedCount >= totalSpots) {
            newStatus = "closed";
          }
        }

        if (newStatus && newStatus !== gig.status) {
          await this._model.updateOne({ _id: gig._id }, { status: newStatus }).exec();

          if (newStatus === "cancelled" && acceptedCount > 0) {
            const acceptedApps = await GigApplicationModel.find({
              gigId: gig._id,
              status: "accepted"
            }).exec();

            for (const app of acceptedApps) {
              app.status = "rejected";
              await app.save();

              await NotificationModel.create({
                userId: app.workerId,
                title: "Gig Cancelled",
                message: `The gig "${gig.title}" has been automatically cancelled because there were no applicants 5 hours before event time.`,
                type: "gig_cancelled"
              });
            }

            await GigApplicationModel.updateMany(
              { gigId: gig._id, status: "pending" },
              { status: "rejected" }
            ).exec();
          }
        }
      } catch (err) {
        console.error(`Error syncing state for gig ${gig._id}:`, err);
      }
    }
  }

  override async findById(id: string): Promise<IGig | null> {
    await this._syncGigStates();
    return await this._model.findOne({ _id: id, isDeleted: false })
      .populate("categoryId")
      .populate("roles")
      .exec();
  }

  async findByOwnerId(ownerId: string, filters?: { status?: string }): Promise<IGig[]> {
    await this._syncGigStates();
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
    await this._syncGigStates();
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
    await this._syncGigStates();
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
    await this._syncGigStates();
    return await this._model.findOne({ _id: id, isDeleted: false })
      .populate("categoryId")
      .populate("ownerId", "name email role profileImage")
      .populate("roles")
      .exec();
  }

  async findGigIdsByTitle(searchQuery: string): Promise<string[]> {
    const gigs = await this._model.find({
      title: { $regex: searchQuery, $options: "i" }
    }, { _id: 1 }).exec();
    return gigs.map(g => g._id.toString());
  }
}
