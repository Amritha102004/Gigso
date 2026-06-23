import { GigRoleModel } from "../models/gigRole.model";
import { IGigRole } from "../interfaces/gig.interface";
import { IGigRoleRepository } from "../interfaces/repositories/gig.repository.interface";
import { BaseRepository } from "./base.repository";

export class GigRoleRepository extends BaseRepository<IGigRole> implements IGigRoleRepository {
  constructor() {
    super(GigRoleModel);
  }

  async findByGigId(gigId: string): Promise<IGigRole[]> {
    return await GigRoleModel.find({ gigId }).exec();
  }

  async deleteByGigId(gigId: string): Promise<boolean> {
    const result = await GigRoleModel.deleteMany({ gigId }).exec();
    return result.acknowledged;
  }
}
