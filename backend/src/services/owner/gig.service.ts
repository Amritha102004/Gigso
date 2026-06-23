import { Types } from "mongoose";
import { IOwnerGigService, ICreateGigInput, IUpdateGigInput } from "../../interfaces/services/owner/gig.service.interface";
import { ICategoryRepository, IGigRepository, IGigRoleRepository } from "../../interfaces/repositories/gig.repository.interface";
import { ICategory, IGig } from "../../interfaces/gig.interface";

export class OwnerGigService implements IOwnerGigService {
  constructor(
    private _categoryRepo: ICategoryRepository,
    private _gigRepo: IGigRepository,
    private _gigRoleRepo: IGigRoleRepository
  ) {}

  async createGig(ownerId: string, input: ICreateGigInput): Promise<IGig> {
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
    return gig;
  }

  async getOwnerGigs(ownerId: string, status?: string): Promise<IGig[]> {
    return await this._gigRepo.findByOwnerId(ownerId, status ? { status } : undefined);
  }

  async getGigById(gigId: string, ownerId: string): Promise<IGig> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      const error: any = new Error("Gig not found or unauthorized access");
      error.statusCode = 404;
      throw error;
    }
    return gig;
  }

  async updateGig(gigId: string, ownerId: string, input: IUpdateGigInput): Promise<IGig> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      const error: any = new Error("Gig not found or unauthorized access");
      error.statusCode = 404;
      throw error;
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
    return updatedGig;
  }

  async softDeleteGig(gigId: string, ownerId: string): Promise<boolean> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      const error: any = new Error("Gig not found or unauthorized access");
      error.statusCode = 404;
      throw error;
    }
    return await this._gigRepo.softDelete(gigId);
  }

  async publishGig(gigId: string, ownerId: string): Promise<IGig> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      const error: any = new Error("Gig not found or unauthorized access");
      error.statusCode = 404;
      throw error;
    }
    if (gig.status !== "draft") {
      const error: any = new Error("Only draft gigs can be published");
      error.statusCode = 400;
      throw error;
    }

    await this._gigRepo.update(gigId, { status: "active" } as any);
    const updated = await this._gigRepo.findById(gigId);
    if (!updated) {
      throw new Error("Gig not found after publish");
    }
    return updated;
  }

  async markAsCompleted(gigId: string, ownerId: string): Promise<IGig> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig || gig.ownerId.toString() !== ownerId) {
      const error: any = new Error("Gig not found or unauthorized access");
      error.statusCode = 404;
      throw error;
    }
    if (gig.status !== "active") {
      const error: any = new Error("Only active gigs can be marked as completed");
      error.statusCode = 400;
      throw error;
    }

    await this._gigRepo.update(gigId, { status: "completed" } as any);
    const updated = await this._gigRepo.findById(gigId);
    if (!updated) {
      throw new Error("Gig not found after completion");
    }
    return updated;
  }

  async getCategories(): Promise<ICategory[]> {
    return await this._categoryRepo.findAll();
  }
}
