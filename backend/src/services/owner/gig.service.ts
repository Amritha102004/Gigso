import { Types } from "mongoose";
import type { IOwnerGigService } from "../../interfaces/services/owner/gig.service.interface";
import type { ICategoryRepository, IGigRepository, IGigRoleRepository } from "../../interfaces/repositories/gig.repository.interface";
import type { IGigApplicationRepository } from "../../interfaces/repositories/application.repository.interface";
import type {
  CreateGigRequestDTO,
  UpdateGigRequestDTO,
  GigResponseDTO,
  GigListItemDTO,
} from "../../dtos/gig.dto";
import type { CategoryDTO } from "../../dtos/category.dto";
import { toGigResponseDTO, toGigListItemDTO } from "../../mappers/gig.mapper";
import { toCategoryDTO } from "../../mappers/category.mapper";
import { AppError } from "../../utils/errors";

import type { IGig } from "../../interfaces/gig.interface";
import { NotificationService } from "../notification.service";
import type { PaymentRepository } from "../../repositories/payment.repository";

export class OwnerGigService implements IOwnerGigService {
  constructor(
    private _categoryRepo: ICategoryRepository,
    private _gigRepo: IGigRepository,
    private _gigRoleRepo: IGigRoleRepository,
    private _applicationRepo: IGigApplicationRepository,
    private _notificationService: NotificationService,
    private _paymentRepo: PaymentRepository
  ) {}

  async createGig(ownerId: string, input: CreateGigRequestDTO): Promise<GigResponseDTO> {
    const gigId = new Types.ObjectId();

    // 1. Calculate totalBudget
    let totalBudget = 0;
    const rolesData = input.roles || [];
    for (const r of rolesData) {
      totalBudget += r.spots * r.payPerPerson;
    }

    // 2. Create roles
    const roleIds: Types.ObjectId[] = [];
    for (const r of rolesData) {
      const createdRole = await this._gigRoleRepo.create({
        gigId: gigId,
        roleName: r.roleName,
        spots: r.spots,
        payPerPerson: r.payPerPerson,
      });
      roleIds.push(createdRole._id as Types.ObjectId);
    }

    // 3. Create gig
    await this._gigRepo.create({
      _id: gigId,
      ownerId: new Types.ObjectId(ownerId),
      title: input.title,
      description: input.description,
      categoryId: new Types.ObjectId(input.categoryId),
      location: input.location,
      eventDate: new Date(input.eventDate),
      startTime: input.startTime,
      roles: roleIds,
      totalBudget,
      status: input.status || "draft",
      paymentStatus: "unpaid",
      isDeleted: false,
    });

    const gig = await this._gigRepo.findById(gigId.toString());
    if (!gig) {
      throw new Error("Gig was not created properly");
    }
    return toGigResponseDTO(gig);
  }

  async getOwnerGigs(ownerId: string, status?: string): Promise<GigListItemDTO[]> {
    const gigs = await this._gigRepo.findByOwnerId(ownerId, status ? { status } : undefined);
    const gigIds = gigs.map((g) => g._id.toString());
    const counts = await this._applicationRepo.getCountsForGigs(gigIds);

    return gigs.map((gig) => {
      const gigCount = counts.find((c) => c.gigId === gig._id.toString());
      return toGigListItemDTO(
        gig,
        gigCount ? gigCount.pendingCount : undefined,
        gigCount ? gigCount.acceptedCount : undefined
      );
    });
  }

  async getGigById(gigId: string, ownerId: string): Promise<GigResponseDTO> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      throw new AppError("Gig not found or unauthorized access", 404);
    }
    const roleCounts = await this._applicationRepo.getAcceptedCountsByRolesForGig(gigId);
    const countMap: Record<string, number> = {};
    for (const rc of roleCounts) {
      countMap[rc.roleId] = rc.count;
    }
    return toGigResponseDTO(gig, countMap);
  }

  async updateGig(gigId: string, ownerId: string, input: UpdateGigRequestDTO): Promise<GigResponseDTO> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      throw new AppError("Gig not found or unauthorized access", 404);
    }

    const applications = await this._applicationRepo.findByGigId(gigId);
    const hasActiveOrPending = applications.some((app) => app.status === "pending" || app.status === "accepted");
    if (hasActiveOrPending) {
      throw new AppError("Cannot edit gig once active or pending applications have been submitted", 400);
    }

    const updateData: Partial<IGig> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.categoryId !== undefined) updateData.categoryId = new Types.ObjectId(input.categoryId);
    if (input.location !== undefined) updateData.location = input.location;
    if (input.eventDate !== undefined) updateData.eventDate = new Date(input.eventDate);
    if (input.startTime !== undefined) updateData.startTime = input.startTime;

    if (input.roles !== undefined) {
      // Re-create roles
      await this._gigRoleRepo.deleteByGigId(gigId);

      let totalBudget = 0;
      const roleIds: Types.ObjectId[] = [];
      for (const r of input.roles) {
        totalBudget += r.spots * r.payPerPerson;
        const createdRole = await this._gigRoleRepo.create({
          gigId: new Types.ObjectId(gigId),
          roleName: r.roleName,
          spots: r.spots,
          payPerPerson: r.payPerPerson,
        });
        roleIds.push(createdRole._id as Types.ObjectId);
      }

      updateData.roles = roleIds;
      updateData.totalBudget = totalBudget;
    }

    await this._gigRepo.update(gigId, updateData);

    const updatedGig = await this._gigRepo.findById(gigId);
    if (!updatedGig) {
      throw new Error("Gig not found after update");
    }
    return toGigResponseDTO(updatedGig);
  }

  async softDeleteGig(gigId: string, ownerId: string): Promise<boolean> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      throw new AppError("Gig not found or unauthorized access", 404);
    }

    if (gig.status === "draft") {
      return await this._gigRepo.softDelete(gigId);
    }

    const apps = await this._applicationRepo.findByGigId(gigId);
    const acceptedApps = apps.filter((app) => app.status === "accepted");
    const acceptedCount = acceptedApps.length;

    if (acceptedCount > 0) {
      const eventStart = new Date(gig.eventDate);
      const match = gig.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3];
        if (ampm) {
          if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
          if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
        }
        eventStart.setHours(hours, minutes, 0, 0);
      }

      const msDiff = eventStart.getTime() - Date.now();
      const daysLeft = msDiff / (1000 * 60 * 60 * 24);

      if (daysLeft < 2) {
        throw new AppError("Cannot cancel a gig with accepted applicants less than 2 days before the event", 400);
      }

      for (const app of acceptedApps) {
        const wId = (app.workerId as any)._id?.toString() || app.workerId.toString();
        await this._applicationRepo.update(app._id.toString(), { status: "rejected" });

        await this._notificationService.createNotification(
          wId,
          "Gig Cancelled",
          `Your application for "${gig.title}" has been rejected because the owner cancelled the gig.`,
          "gig_cancelled"
        );
      }
    }

    const pendingApps = apps.filter((app) => app.status === "pending");
    for (const app of pendingApps) {
      await this._applicationRepo.update(app._id.toString(), { status: "rejected" });
    }

    await this._gigRepo.update(gigId, { status: "cancelled" });
    return true;
  }

  async publishGig(gigId: string, ownerId: string): Promise<GigResponseDTO> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      throw new AppError("Gig not found or unauthorized access", 404);
    }
    if (gig.status !== "draft") {
      throw new AppError("Only draft gigs can be published", 400);
    }

    if (!gig.roles || gig.roles.length === 0) {
      throw new AppError("At least one role is required to publish the gig", 400);
    }

    await this._gigRepo.update(gigId, { status: "active" });
    const updated = await this._gigRepo.findById(gigId);
    if (!updated) {
      throw new Error("Gig not found after publish");
    }
    return toGigResponseDTO(updated);
  }

  async markAsCompleted(gigId: string, ownerId: string): Promise<GigResponseDTO> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      throw new AppError("Gig not found or unauthorized access", 404);
    }
    if (gig.status !== "active") {
      throw new AppError("Only active gigs can be closed manually", 400);
    }

    await this._gigRepo.update(gigId, { status: "closed" });
    const updated = await this._gigRepo.findById(gigId);
    if (!updated) {
      throw new Error("Gig not found after closing");
    }
    return toGigResponseDTO(updated);
  }

  async getCategories(): Promise<CategoryDTO[]> {
    const categories = await this._categoryRepo.findAll();
    return categories.map(toCategoryDTO);
  }

  async getOwnerDashboardStats(ownerId: string, range: string = "30"): Promise<any> {
    // 1. Calculate startDate for timeline filters
    let startDate: Date | undefined = undefined;
    if (range && range !== "all") {
      const days = Number(range) || 30;
      startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    // 2. Active Gigs Count (currently open gigs)
    const activeGigsCount = await (this._gigRepo as any).countActiveGigs(ownerId);

    // 3. Retrieve all gigs for this owner
    const gigs = await (this._gigRepo as any)._model.find({ ownerId: new Types.ObjectId(ownerId), isDeleted: false }, { _id: 1 }).exec();
    const gigIds = gigs.map((g: any) => g._id);

    // 4. Stale applications fix: Count pending applications ONLY for currently active (live) gigs
    const activeGigs = await (this._gigRepo as any)._model.find({
      ownerId: new Types.ObjectId(ownerId),
      status: "active",
      isDeleted: false,
    }, { _id: 1 }).exec();
    const activeGigIds = activeGigs.map((g: any) => g._id);
    const pendingReviews = await (this._applicationRepo as any)._model.countDocuments({
      gigId: { $in: activeGigIds },
      status: "pending",
    });

    // 5. Total Crew Hired (date-filtered by timeline range)
    const hiredCrewQuery: any = { gigId: { $in: gigIds }, status: "accepted" };
    if (startDate) {
      hiredCrewQuery.createdAt = { $gte: startDate };
    }
    const totalStaffHired = await (this._applicationRepo as any)._model.countDocuments(hiredCrewQuery);

    // 6. Total Escrow Spent (date-filtered by timeline range)
    const totalSpent = await this._paymentRepo.countTotalSpentForOwner(ownerId, startDate);

    // 7. Recent Gigs List (for table tracker)
    const rawGigs = await (this._gigRepo as any).findRecentGigs(ownerId, 5);
    const recentGigs = [];
    for (const g of rawGigs) {
      const acceptedCount = await (this._applicationRepo as any)._model.countDocuments({
        gigId: g._id,
        status: "accepted",
      });
      let totalSpots = 0;
      const populatedGig = await (g as any).populate("roles");
      if (populatedGig.roles) {
        for (const r of populatedGig.roles as any[]) {
          totalSpots += r.spots || 0;
        }
      }
      recentGigs.push({
        ...toGigResponseDTO(g),
        spotsFilled: acceptedCount,
        totalSpots,
      });
    }

    // 8. Upcoming Events (Active gigs scheduled in the future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rawUpcomingGigs = await (this._gigRepo as any)._model.find({
      ownerId: new Types.ObjectId(ownerId),
      status: "active",
      eventDate: { $gte: today },
      isDeleted: false,
    })
      .sort({ eventDate: 1 })
      .limit(5)
      .exec();

    const upcomingGigs = [];
    for (const g of rawUpcomingGigs) {
      const acceptedCount = await (this._applicationRepo as any)._model.countDocuments({
        gigId: g._id,
        status: "accepted",
      });
      let totalSpots = 0;
      const populatedGig = await (g as any).populate("roles");
      if (populatedGig.roles) {
        for (const r of populatedGig.roles as any[]) {
          totalSpots += r.spots || 0;
        }
      }
      upcomingGigs.push({
        id: g._id,
        title: g.title,
        eventDate: g.eventDate,
        startTime: g.startTime,
        spotsFilled: acceptedCount,
        totalSpots,
      });
    }

    // 9. Recent Payments (latest 3 successful checkouts)
    const recentPayments = await (this._paymentRepo as any)._model.find({
      ownerId: new Types.ObjectId(ownerId),
      paymentStatus: "paid",
    })
      .populate("gigId", "title")
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();

    const formattedPayments = recentPayments.map((p: any) => ({
      id: p._id,
      transactionId: p.transactionId,
      amount: p.totalAmount,
      fee: p.platformFee,
      gigTitle: p.gigId?.title || "Staffing Checkout",
      createdAt: p.createdAt,
    }));

    return {
      stats: {
        activeGigs: activeGigsCount,
        pendingReviews,
        hiredCrew: totalStaffHired,
        totalSpent,
      },
      recentGigs,
      upcomingGigs,
      recentPayments: formattedPayments,
    };
  }
}
