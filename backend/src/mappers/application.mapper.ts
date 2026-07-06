import type { IGigApplication } from "../interfaces/application.interface";
import type { IWorkerProfile, IUser } from "../interfaces/user.interface";
import type { IGig, IGigRole } from "../interfaces/gig.interface";
import type { GigApplicationDTO } from "../dtos/application.dto";
import { toGigResponseDTO, toGigRoleDTO } from "./gig.mapper";
import { toUserResponse } from "./user.mapper";

export const toGigApplicationDTO = (
  app: IGigApplication,
  profile?: IWorkerProfile | null
): GigApplicationDTO => {
  const isGigPopulated = app.gigId && typeof (app.gigId as any).title === "string";
  const isRolePopulated = app.roleId && typeof (app.roleId as any).roleName === "string";
  const isWorkerPopulated = app.workerId && typeof (app.workerId as any).name === "string";

  const gigDto = isGigPopulated ? toGigResponseDTO(app.gigId as any as IGig) : undefined;
  const roleDto = isRolePopulated ? toGigRoleDTO(app.roleId as any as IGigRole) : undefined;
  
  let workerDto = undefined;
  if (isWorkerPopulated) {
    const userResponse = toUserResponse(app.workerId as any as IUser);
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
    gigId: isGigPopulated ? (app.gigId as any)._id.toString() : app.gigId.toString(),
    roleId: isRolePopulated ? (app.roleId as any)._id.toString() : app.roleId.toString(),
    workerId: isWorkerPopulated ? (app.workerId as any)._id.toString() : app.workerId.toString(),
    status: app.status,
    appliedAt: app.appliedAt.toISOString(),
    gig: gigDto,
    role: roleDto,
    worker: workerDto,
  };
};
