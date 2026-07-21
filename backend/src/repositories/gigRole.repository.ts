import { GigRoleModel } from "../models/gigRole.model";
import type { IGigRole } from "../interfaces/gig.interface";
import type { IGigRoleRepository } from "../interfaces/repositories/gig.repository.interface";
import { BaseRepository } from "./base.repository";

export class GigRoleRepository extends BaseRepository<IGigRole> implements IGigRoleRepository {
  constructor() {
    super(GigRoleModel);
  }

  async findByGigId(gigId: string): Promise<IGigRole[]> {
    return await this._model.find({ gigId }).exec();
  }

  async deleteByGigId(gigId: string): Promise<boolean> {
    const result = await this._model.deleteMany({ gigId }).exec();
    return result.acknowledged;
  }
}
