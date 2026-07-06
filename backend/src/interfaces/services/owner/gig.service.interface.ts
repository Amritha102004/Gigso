import type { ICategory, IGig } from "../../gig.interface";

export interface ICreateGigRoleInput {
  roleName: string;
  spots: number;
  payPerPerson: number;
}

export interface ICreateGigInput {
  title: string;
  description: string;
  categoryId: string;
  location: string;
  eventDate: Date;
  startTime: string;
  roles: ICreateGigRoleInput[];
  status?: "draft" | "active";
}

export interface IUpdateGigInput {
  title?: string;
  description?: string;
  categoryId?: string;
  location?: string;
  eventDate?: Date;
  startTime?: string;
  roles?: ICreateGigRoleInput[];
}

export interface IOwnerGigWithCounts {
  gig: IGig;
  pendingCount: number;
  acceptedCount: number;
}

export interface IOwnerGigService {
  createGig(ownerId: string, input: ICreateGigInput): Promise<IGig>;
  getOwnerGigs(ownerId: string, status?: string): Promise<IOwnerGigWithCounts[]>;
  getGigById(gigId: string, ownerId: string): Promise<IGig>;
  updateGig(gigId: string, ownerId: string, input: IUpdateGigInput): Promise<IGig>;
  softDeleteGig(gigId: string, ownerId: string): Promise<boolean>;
  publishGig(gigId: string, ownerId: string): Promise<IGig>;
  markAsCompleted(gigId: string, ownerId: string): Promise<IGig>;
  getCategories(): Promise<ICategory[]>;
}
