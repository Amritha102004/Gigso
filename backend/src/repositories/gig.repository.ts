import { GigModel } from "../models/gig.model";
import { IGig } from "../interfaces/gig.interface";
import { IGigRepository } from "../interfaces/repositories/gig.repository.interface";
import { BaseRepository } from "./base.repository";

export class GigRepository extends BaseRepository<IGig> implements IGigRepository {
  constructor() {
    super(GigModel);
  }

  override async findById(id: string): Promise<IGig | null> {
    return await GigModel.findOne({ _id: id, isDeleted: false })
      .populate("categoryId")
      .populate("roles")
      .exec();
  }

  async findByOwnerId(ownerId: string, filters?: { status?: string }): Promise<IGig[]> {
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

  async softDelete(id: string): Promise<boolean> {
    const result = await GigModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).exec();
    return !!result;
  }
}
