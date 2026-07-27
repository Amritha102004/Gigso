import type { IGig, IGigRole, ICategory } from "../interfaces/gig.interface";
import type { GigResponseDTO, GigListItemDTO, GigRoleDTO } from "../dtos/gig.dto";
import { toCategoryDTO } from "./category.mapper";
import type { Types } from "mongoose";

interface IPopulatedOwner {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

const isCategoryPopulated = (val: unknown): val is ICategory => {
  return typeof val === "object" && val !== null && "name" in val;
};

const isRolesPopulated = (val: unknown): val is IGigRole[] => {
  return Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null && "roleName" in val[0];
};

const isOwnerPopulated = (val: unknown): val is IPopulatedOwner => {
  return typeof val === "object" && val !== null && "name" in val && "email" in val;
};

export const toGigRoleDTO = (role: IGigRole, filledSpots?: number): GigRoleDTO => {
  return {
    id: role._id.toString(),
    gigId: role.gigId.toString(),
    roleName: role.roleName,
    spots: role.spots,
    payPerPerson: role.payPerPerson,
    filledSpots: filledSpots ?? 0,
  };
};

export const toGigResponseDTO = (gig: IGig, roleFilledCounts?: Record<string, number>): GigResponseDTO => {
  const rawCategory: unknown = gig.categoryId;
  const rawRoles: unknown = gig.roles;
  const rawOwner: unknown = gig.ownerId;

  const category = isCategoryPopulated(rawCategory) ? rawCategory : null;
  const roles = isRolesPopulated(rawRoles) ? rawRoles : null;
  const owner = isOwnerPopulated(rawOwner) ? rawOwner : null;

  return {
    id: gig._id.toString(),
    ownerId: owner
      ? { id: owner._id.toString(), name: owner.name, email: owner.email }
      : gig.ownerId.toString(),
    title: gig.title,
    description: gig.description,
    category: category 
      ? toCategoryDTO(category) 
      : { id: gig.categoryId?.toString() || "", name: "Uncategorized", description: "", icon: "" },
    location: gig.location,
    eventDate: gig.eventDate.toISOString(),
    startTime: gig.startTime,
    roles: roles
      ? roles.map((r) => toGigRoleDTO(r, roleFilledCounts ? roleFilledCounts[r._id.toString()] : undefined))
      : [],
    totalBudget: gig.totalBudget,
    status: gig.status,
    paymentStatus: gig.paymentStatus,
    isFlagged: gig.isFlagged,
    createdAt: gig.createdAt.toISOString(),
    updatedAt: gig.updatedAt.toISOString(),
  };
};

export const toGigListItemDTO = (
  gig: IGig,
  pendingApplicationsCount?: number,
  filledSpotsCount?: number
): GigListItemDTO => {
  const rawCategory: unknown = gig.categoryId;
  const rawRoles: unknown = gig.roles;
  const rawOwner: unknown = gig.ownerId;

  const category = isCategoryPopulated(rawCategory) ? rawCategory : null;
  const roles = isRolesPopulated(rawRoles) ? rawRoles : null;
  const owner = isOwnerPopulated(rawOwner) ? rawOwner : null;

  const totalRoles = roles ? roles.length : 0;
  const totalSpots = roles ? roles.reduce((sum, role) => sum + role.spots, 0) : 0;
  const filledSpots = filledSpotsCount ?? 0;

  return {
    id: gig._id.toString(),
    title: gig.title,
    category: category 
      ? toCategoryDTO(category) 
      : { id: gig.categoryId?.toString() || "", name: "Uncategorized", description: "", icon: "" },
    eventDate: gig.eventDate.toISOString(),
    status: gig.status,
    totalRoles,
    filledSpots,
    totalSpots,
    location: gig.location,
    totalBudget: gig.totalBudget,
    isFlagged: gig.isFlagged,
    ownerId: owner
      ? { id: owner._id.toString(), name: owner.name, email: owner.email }
      : gig.ownerId.toString(),
    pendingApplicationsCount,
  };
};
