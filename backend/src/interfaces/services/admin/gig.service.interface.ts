import type { GigListItemDTO, GigResponseDTO, AdminGigsQueryDTO } from "../../../dtos/gig.dto";
import type { OwnerProfileResponseDTO } from "../../../dtos/ownerProfile.dto";
import type { GigApplicationDTO } from "../../../dtos/application.dto";

export interface IAdminGigService {
  getAllGigs(
    filters: AdminGigsQueryDTO,
    page: number,
    limit: number
  ): Promise<{
    gigs: GigListItemDTO[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getGigById(id: string): Promise<{ gig: GigResponseDTO; ownerProfile: OwnerProfileResponseDTO | null; applications: GigApplicationDTO[] }>;
  toggleFlagGig(id: string, isFlagged: boolean): Promise<GigResponseDTO>;
  deleteGig(id: string): Promise<boolean>;
  updateApplicationStatus(
    gigId: string,
    applicationId: string,
    status: "accepted" | "rejected"
  ): Promise<GigApplicationDTO>;
}
