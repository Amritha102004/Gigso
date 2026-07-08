import type { IGig } from "../../gig.interface";

export interface IAdminGigService {
  getAllGigs(
    filters: {
      search?: string;
      categoryId?: string;
      status?: string;
      date?: string;
    },
    page: number,
    limit: number
  ): Promise<{
    gigs: IGig[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getGigById(id: string): Promise<{ gig: IGig; ownerProfile: any; applications: any[] }>;
  toggleFlagGig(id: string, isFlagged: boolean): Promise<IGig>;
  deleteGig(id: string): Promise<boolean>;
  updateApplicationStatus(
    gigId: string,
    applicationId: string,
    status: "accepted" | "rejected"
  ): Promise<any>;
}
