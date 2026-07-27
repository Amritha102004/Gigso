import { BaseRepository } from "./base.repository";
import { GigApplicationModel } from "../models/application.model";
import type { IGigApplication } from "../interfaces/application.interface";
import type { IGigApplicationRepository } from "../interfaces/repositories/application.repository.interface";
import { Types } from "mongoose";

export class GigApplicationRepository extends BaseRepository<IGigApplication> implements IGigApplicationRepository {
  constructor() {
    super(GigApplicationModel);
  }

  async findByWorkerId(workerId: string, status?: string): Promise<IGigApplication[]> {
    const query: {
      workerId: Types.ObjectId;
      status?: string;
    } = { workerId: new Types.ObjectId(workerId) };
    if (status) {
      query.status = status;
    }
    return await this._model.find(query)
      .populate({
        path: "gigId",
        populate: [
          { path: "categoryId" },
          { path: "roles" }
        ]
      })
      .populate("roleId")
      .sort({ appliedAt: -1 })
      .exec();
  }

  async findByGigId(gigId: string): Promise<IGigApplication[]> {
    return await this._model.find({ gigId: new Types.ObjectId(gigId) })
      .populate("workerId")
      .populate("roleId")
      .sort({ appliedAt: -1 })
      .exec();
  }

  async findByGigIdAndWorkerId(gigId: string, workerId: string): Promise<IGigApplication[]> {
    return await this._model.find({
      gigId: new Types.ObjectId(gigId),
      workerId: new Types.ObjectId(workerId)
    })
      .populate("roleId")
      .exec();
  }

  async findPendingCountForGig(gigId: string): Promise<number> {
    return await this._model.countDocuments({
      gigId: new Types.ObjectId(gigId),
      status: "pending"
    }).exec();
  }

  async findAcceptedCountForRole(roleId: string): Promise<number> {
    return await this._model.countDocuments({
      roleId: new Types.ObjectId(roleId),
      status: "accepted"
    }).exec();
  }

  async getCountsForGigs(gigIds: string[]): Promise<{ gigId: string; pendingCount: number; acceptedCount: number }[]> {
    const objectIds = gigIds.map((id) => new Types.ObjectId(id));

    const pendingCounts = await this._model.aggregate([
      { $match: { gigId: { $in: objectIds }, status: "pending" } },
      { $group: { _id: "$gigId", count: { $sum: 1 } } }
    ]);

    const acceptedCounts = await this._model.aggregate([
      { $match: { gigId: { $in: objectIds }, status: "accepted" } },
      { $group: { _id: "$gigId", count: { $sum: 1 } } }
    ]);

    return gigIds.map((id) => {
      const pendingObj = pendingCounts.find((c) => c._id.toString() === id);
      const acceptedObj = acceptedCounts.find((c) => c._id.toString() === id);
      return {
        gigId: id,
        pendingCount: pendingObj ? pendingObj.count : 0,
        acceptedCount: acceptedObj ? acceptedObj.count : 0,
      };
    });
  }
}
