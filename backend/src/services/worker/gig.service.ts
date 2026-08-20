import { Types } from "mongoose";
import type { IWorkerGigService } from "../../interfaces/services/worker/gig.service.interface";
import type { IGigRepository, ICategoryRepository } from "../../interfaces/repositories/gig.repository.interface";
import type { IGigApplicationRepository } from "../../interfaces/repositories/application.repository.interface";
import type { WorkerPaymentRepository } from "../../repositories/workerPayment.repository";
import type { ReviewRepository } from "../../repositories/review.repository";
import type { BrowseGigsQueryDTO, GigListItemDTO, GigResponseDTO } from "../../dtos/gig.dto";
import type { CategoryDTO } from "../../dtos/category.dto";
import { toGigResponseDTO, toGigListItemDTO } from "../../mappers/gig.mapper";
import { toCategoryDTO } from "../../mappers/category.mapper";

export class WorkerGigService implements IWorkerGigService {
  constructor(
    private _gigRepo: IGigRepository,
    private _categoryRepo: ICategoryRepository,
    private _applicationRepo: IGigApplicationRepository,
    private _workerPaymentRepo: WorkerPaymentRepository,
    private _reviewRepo: ReviewRepository
  ) {}

  async browseGigs(filters?: BrowseGigsQueryDTO): Promise<GigListItemDTO[]> {
    const gigs = await this._gigRepo.findActiveGigs(filters);
    const gigIds = gigs.map((g) => g._id.toString());
    const counts = gigIds.length > 0 ? await this._applicationRepo.getCountsForGigs(gigIds) : [];

    return gigs.map((gig) => {
      const gigCount = counts.find((c) => c.gigId === gig._id.toString());
      return toGigListItemDTO(
        gig,
        gigCount ? gigCount.pendingCount : undefined,
        gigCount ? gigCount.acceptedCount : undefined
      );
    });
  }

  async getGigById(gigId: string, workerId?: string): Promise<GigResponseDTO> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.isDeleted) {
      throw new Error("Gig not found");
    }

    if (gig.status !== "active") {
      let hasApplied = false;
      if (workerId) {
        const apps = await this._applicationRepo.findByGigIdAndWorkerId(gigId, workerId);
        if (apps && apps.length > 0) {
          hasApplied = true;
        }
      }
      if (!hasApplied) {
        throw new Error("Gig is no longer active");
      }
    }

    const roleCounts = await this._applicationRepo.getAcceptedCountsByRolesForGig(gigId);
    const countMap: Record<string, number> = {};
    for (const rc of roleCounts) {
      countMap[rc.roleId] = rc.count;
    }

    return toGigResponseDTO(gig, countMap);
  }

  async getCategories(): Promise<CategoryDTO[]> {
    const categories = await this._categoryRepo.findAll();
    return categories.map(toCategoryDTO);
  }

  async getWorkerDashboardStats(workerId: string, range: string = "30"): Promise<any> {
    // 1. Calculate startDate based on timeline range
    let startDate: Date | undefined = undefined;
    if (range && range !== "all") {
      const days = Number(range) || 30;
      startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    // 2. Total Earnings (dynamically aggregated)
    const totalEarnings = await this._workerPaymentRepo.countTotalEarningsForWorker(workerId, startDate);

    // 3. Confirmed Shifts Count (accepted applications in the range)
    const confirmedShiftsQuery: any = { workerId: new Types.ObjectId(workerId), status: "accepted" };
    if (startDate) {
      confirmedShiftsQuery.appliedAt = { $gte: startDate };
    }
    const confirmedShifts = await (this._applicationRepo as any)._model.countDocuments(confirmedShiftsQuery);

    // 4. Applied Gigs Count (total applications in the range)
    const appliedGigsQuery: any = { workerId: new Types.ObjectId(workerId) };
    if (startDate) {
      appliedGigsQuery.appliedAt = { $gte: startDate };
    }
    const appliedGigs = await (this._applicationRepo as any)._model.countDocuments(appliedGigsQuery);

    // 5. Worker Rating (dynamically calculated from ReviewRepository)
    const reviewSummary = await this._reviewRepo.getSummaryForUser(workerId);
    const averageRating = reviewSummary.average || 5.0;

    // 6. Upcoming Confirmed Shifts (Accepted gigs scheduled in the future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rawUpcomingApps = await (this._applicationRepo as any)._model.find({
      workerId: new Types.ObjectId(workerId),
      status: "accepted"
    })
      .populate({
        path: "gigId",
        match: { eventDate: { $gte: today }, isDeleted: false }
      })
      .populate("roleId")
      .exec();

    // Filter out applications where the gig eventDate did not match
    const validUpcomingApps = rawUpcomingApps.filter((app: any) => app.gigId !== null);
    
    // Sort chronologically and limit to 5
    const upcomingShifts = validUpcomingApps
      .map((app: any) => ({
        id: app._id,
        title: app.gigId.title,
        location: app.gigId.location,
        eventDate: app.gigId.eventDate,
        startTime: app.gigId.startTime,
        roleName: app.roleId?.roleName || "Crew member",
        pay: app.roleId?.payPerPerson || 0
      }))
      .sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 5);

    // 7. Recent Applications Outcomes (latest 5 applications)
    const recentApps = await (this._applicationRepo as any)._model.find({
      workerId: new Types.ObjectId(workerId)
    })
      .populate("gigId")
      .populate("roleId")
      .sort({ appliedAt: -1 })
      .limit(5)
      .exec();

    const formattedApplications = recentApps.map((app: any) => ({
      id: app._id,
      gigTitle: app.gigId?.title || "Staffing Gig",
      roleName: app.roleId?.roleName || "Crew member",
      status: app.status,
      pay: app.roleId?.payPerPerson || 0,
      appliedAt: app.appliedAt
    }));

    return {
      stats: {
        totalEarnings,
        confirmedShifts,
        appliedGigs,
        rating: averageRating
      },
      upcomingShifts,
      recentApplications: formattedApplications
    };
  }
}
