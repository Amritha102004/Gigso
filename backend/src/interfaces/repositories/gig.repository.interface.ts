import { IBaseRepository } from "./base.repository.interface";
import { ICategory, IGig, IGigRole } from "../gig.interface";

export interface ICategoryRepository extends IBaseRepository<ICategory> {
  findAll(): Promise<ICategory[]>;
  findCategories(filter: Record<string, unknown>, skip: number, limit: number): Promise<{ categories: ICategory[]; total: number }>;
}

export interface IGigRoleRepository extends IBaseRepository<IGigRole> {
  findByGigId(gigId: string): Promise<IGigRole[]>;
  deleteByGigId(gigId: string): Promise<boolean>;
}

export interface IGigRepository extends IBaseRepository<IGig> {
  findByOwnerId(ownerId: string, filters?: { status?: string }): Promise<IGig[]>;
  softDelete(id: string): Promise<boolean>;
}
