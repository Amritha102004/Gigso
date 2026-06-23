import { IGig, IGigRole, ICategory } from "../interfaces/gig.interface";
import { GigResponseDTO, GigListItemDTO, GigRoleDTO } from "../dtos/gig.dto";
import { toCategoryDTO } from "./category.mapper";

export const toGigRoleDTO = (role: IGigRole): GigRoleDTO => {
  return {
    id: role._id.toString(),
    gigId: role.gigId.toString(),
    roleName: role.roleName,
    spots: role.spots,
    payPerPerson: role.payPerPerson,
  };
};

export const toGigResponseDTO = (gig: IGig): GigResponseDTO => {
  const category = gig.categoryId as any as ICategory;
  const roles = (gig.roles || []) as any[] as IGigRole[];

  return {
    id: gig._id.toString(),
    ownerId: gig.ownerId.toString(),
    title: gig.title,
    description: gig.description,
    category: category ? toCategoryDTO(category) : { id: gig.categoryId.toString(), name: "", description: "", icon: "" },
    location: gig.location,
    eventDate: gig.eventDate.toISOString(),
    startTime: gig.startTime,
    roles: roles.map(toGigRoleDTO),
    totalBudget: gig.totalBudget,
    status: gig.status,
    paymentStatus: gig.paymentStatus,
    createdAt: gig.createdAt.toISOString(),
    updatedAt: gig.updatedAt.toISOString(),
  };
};

export const toGigListItemDTO = (gig: IGig): GigListItemDTO => {
  const category = gig.categoryId as any as ICategory;
  const roles = (gig.roles || []) as any[] as IGigRole[];

  const totalRoles = roles.length;
  const totalSpots = roles.reduce((sum, role) => sum + role.spots, 0);
  const filledSpots = 0; // In this phase applications/rosters are not implemented yet.

  return {
    id: gig._id.toString(),
    title: gig.title,
    category: category ? toCategoryDTO(category) : { id: gig.categoryId.toString(), name: "", description: "", icon: "" },
    eventDate: gig.eventDate.toISOString(),
    status: gig.status,
    totalRoles,
    filledSpots,
    totalSpots,
  };
};
