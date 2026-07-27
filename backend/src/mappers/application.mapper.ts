import type { IGigApplication } from "../interfaces/application.interface";
import type { IWorkerProfile, IUser } from "../interfaces/user.interface";
import type { IGig, IGigRole } from "../interfaces/gig.interface";
import type { GigApplicationDTO } from "../dtos/application.dto";
import { toGigResponseDTO, toGigRoleDTO } from "./gig.mapper";
import { toUserResponse } from "./user.mapper";

const isGigPopulated = (val: unknown): val is IGig => {
  return typeof val === "object" && val !== null && "title" in val;
};

const isRolePopulated = (val: unknown): val is IGigRole => {
  return typeof val === "object" && val !== null && "roleName" in val;
};

const isWorkerPopulated = (val: unknown): val is IUser => {
  return typeof val === "object" && val !== null && "name" in val;
};

export const toGigApplicationDTO = (
  app: IGigApplication,
  profile?: IWorkerProfile | null
): GigApplicationDTO => {
  const rawGig: unknown = app.gigId;
  const rawRole: unknown = app.roleId;
  const rawWorker: unknown = app.workerId;

  const gig = isGigPopulated(rawGig) ? rawGig : null;
  const role = isRolePopulated(rawRole) ? rawRole : null;
  const worker = isWorkerPopulated(rawWorker) ? rawWorker : null;

  const gigDto = gig ? toGigResponseDTO(gig) : undefined;
  const roleDto = role ? toGigRoleDTO(role) : undefined;
  
  let workerDto = undefined;
  if (worker) {
    const userResponse = toUserResponse(worker);
    workerDto = {
      ...userResponse,
      profile: profile ? {
        skills: profile.skills || [],
        portfolio: profile.portfolio || [],
        age: profile.age,
        bio: profile.bio,
        location: profile.location,
      } : undefined,
    };
  }

  return {
    id: app._id.toString(),
    gigId: gig ? gig._id.toString() : app.gigId.toString(),
    roleId: role ? role._id.toString() : app.roleId.toString(),
    workerId: worker ? worker._id.toString() : app.workerId.toString(),
    status: app.status,
    appliedAt: app.appliedAt.toISOString(),
    gig: gigDto,
    role: roleDto,
    worker: workerDto,
  };
};
