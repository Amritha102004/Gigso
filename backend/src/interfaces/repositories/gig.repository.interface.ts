import type { IBaseRepository } from "./base.repository.interface";
import type { ICategory, IGig, IGigRole } from "../gig.interface";

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
  findActiveGigs(filters?: {
    search?: string;
    categoryId?: string;
    location?: string;
    minPay?: number;
    date?: string;
  }): Promise<IGig[]>;
  softDelete(id: string): Promise<boolean>;
  findAllGigs(
    filters: { search?: string; categoryId?: string; status?: string; date?: string },
    page: number,
    limit: number
  ): Promise<{ gigs: IGig[]; total: number }>;
}
