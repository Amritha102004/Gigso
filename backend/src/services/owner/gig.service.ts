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

export class OwnerGigService implements IOwnerGigService {
  constructor(
    private _categoryRepo: ICategoryRepository,
    private _gigRepo: IGigRepository,
    private _gigRoleRepo: IGigRoleRepository,
    private _applicationRepo: IGigApplicationRepository
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
        gigId: gigId as any,
        roleName: r.roleName,
        spots: r.spots,
        payPerPerson: r.payPerPerson,
      } as any);
      roleIds.push(createdRole._id as Types.ObjectId);
    }

    // 3. Create gig
    await this._gigRepo.create({
      _id: gigId as any,
      ownerId: new Types.ObjectId(ownerId) as any,
      title: input.title,
      description: input.description,
      categoryId: new Types.ObjectId(input.categoryId) as any,
      location: input.location,
      eventDate: new Date(input.eventDate),
      startTime: input.startTime,
      roles: roleIds as any,
      totalBudget,
      status: input.status || "draft",
      paymentStatus: "unpaid",
      isDeleted: false,
    } as any);

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
      return toGigListItemDTO(gig, gigCount ? gigCount.pendingCount : undefined);
    });
  }

  async getGigById(gigId: string, ownerId: string): Promise<GigResponseDTO> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      throw new AppError("Gig not found or unauthorized access", 404);
    }
    return toGigResponseDTO(gig);
  }

  async updateGig(gigId: string, ownerId: string, input: UpdateGigRequestDTO): Promise<GigResponseDTO> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      throw new AppError("Gig not found or unauthorized access", 404);
    }

    const updateData: any = {};
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
          gigId: new Types.ObjectId(gigId) as any,
          roleName: r.roleName,
          spots: r.spots,
          payPerPerson: r.payPerPerson,
        } as any);
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
    return await this._gigRepo.softDelete(gigId);
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

    await this._gigRepo.update(gigId, { status: "active" } as any);
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
      throw new AppError("Only active gigs can be marked as completed", 400);
    }

    await this._gigRepo.update(gigId, { status: "completed" } as any);
    const updated = await this._gigRepo.findById(gigId);
    if (!updated) {
      throw new Error("Gig not found after completion");
    }
    return toGigResponseDTO(updated);
  }

  async getCategories(): Promise<CategoryDTO[]> {
    const categories = await this._categoryRepo.findAll();
    return categories.map(toCategoryDTO);
  }
}
