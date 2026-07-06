import type { IGig, ICategory } from "../../gig.interface";

export interface IWorkerGigService {
  browseGigs(filters?: {
    search?: string;
    categoryId?: string;
    location?: string;
    minPay?: number;
    date?: string;
  }): Promise<IGig[]>;
  getGigById(gigId: string): Promise<IGig>;
  getCategories(): Promise<ICategory[]>;
}
