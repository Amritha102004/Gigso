import type {
  RegisterUserRequestDTO,
  LoginUserRequestDTO,
  VerifyOtpRequestDTO,
  ResendOtpRequestDTO,
  ResetPasswordRequestDTO,
  ChangePasswordRequestDTO,
  GoogleLoginRequestDTO,
} from "../dtos/user.dto";
import type { SetupWorkerProfileRequestDTO } from "../dtos/workerProfile.dto";
import type { SetupOwnerProfileRequestDTO } from "../dtos/ownerProfile.dto";
import type {
  CreateGigRequestDTO,
  UpdateGigRequestDTO,
  BrowseGigsQueryDTO,
  AdminGigsQueryDTO,
  CreateGigRoleInputDTO,
} from "../dtos/gig.dto";
import type { ApplyForGigRoleRequestDTO, UpdateApplicationStatusRequestDTO } from "../dtos/application.dto";

export const toRegisterUserRequestDTO = (body: any): RegisterUserRequestDTO => ({
  name: String(body.name || "").trim(),
  email: String(body.email || "").trim().toLowerCase(),
  password: String(body.password || ""),
  role: body.role,
});

export const toLoginUserRequestDTO = (body: any): LoginUserRequestDTO => ({
  email: String(body.email || "").trim().toLowerCase(),
  password: String(body.password || ""),
});

export const toVerifyOtpRequestDTO = (body: any): VerifyOtpRequestDTO => ({
  email: String(body.email || "").trim().toLowerCase(),
  otp: String(body.otp || "").trim(),
  type: body.type,
});

export const toResendOtpRequestDTO = (body: any): ResendOtpRequestDTO => ({
  email: String(body.email || "").trim().toLowerCase(),
  type: body.type,
});

export const toResetPasswordRequestDTO = (body: any): ResetPasswordRequestDTO => ({
  token: String(body.token || "").trim(),
  newPassword: String(body.newPassword || ""),
});

export const toChangePasswordRequestDTO = (body: any): ChangePasswordRequestDTO => ({
  currentPassword: String(body.currentPassword || ""),
  newPassword: String(body.newPassword || ""),
});

export const toGoogleLoginRequestDTO = (body: any): GoogleLoginRequestDTO => ({
  credential: String(body.credential || "").trim(),
  role: body.role,
});

export const toSetupWorkerProfileRequestDTO = (body: any): SetupWorkerProfileRequestDTO => ({
  name: body.name !== undefined ? String(body.name).trim() : undefined,
  phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
  profileImage: body.profileImage !== undefined ? String(body.profileImage).trim() : undefined,
  skills: Array.isArray(body.skills) ? body.skills.map((s: any) => String(s).trim()) : undefined,
  portfolio: Array.isArray(body.portfolio) ? body.portfolio.map((p: any) => String(p).trim()) : undefined,
  age: body.age !== undefined ? Number(body.age) : undefined,
  bio: body.bio !== undefined ? String(body.bio).trim() : undefined,
  location: body.location !== undefined ? String(body.location).trim() : undefined,
});

export const toSetupOwnerProfileRequestDTO = (body: any): SetupOwnerProfileRequestDTO => ({
  name: body.name !== undefined ? String(body.name).trim() : undefined,
  phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
  profileImage: body.profileImage !== undefined ? String(body.profileImage).trim() : undefined,
  businessName: body.businessName !== undefined ? String(body.businessName).trim() : undefined,
  industry: body.industry !== undefined ? String(body.industry).trim() : undefined,
  companySize: body.companySize !== undefined ? String(body.companySize).trim() : undefined,
  website: body.website !== undefined ? String(body.website).trim() : undefined,
  description: body.description !== undefined ? String(body.description).trim() : undefined,
  location: body.location !== undefined ? String(body.location).trim() : undefined,
});

const toGigRoleInput = (r: any): CreateGigRoleInputDTO => ({
  roleName: String(r.roleName || "").trim(),
  spots: Number(r.spots || 0),
  payPerPerson: Number(r.payPerPerson || 0),
});

export const toCreateGigRequestDTO = (body: any): CreateGigRequestDTO => ({
  title: String(body.title || "").trim(),
  description: String(body.description || "").trim(),
  categoryId: String(body.categoryId || "").trim(),
  location: String(body.location || "").trim(),
  eventDate: String(body.eventDate || "").trim(),
  startTime: String(body.startTime || "").trim(),
  roles: Array.isArray(body.roles) ? body.roles.map(toGigRoleInput) : [],
  status: body.status,
});

export const toUpdateGigRequestDTO = (body: any): UpdateGigRequestDTO => ({
  title: body.title !== undefined ? String(body.title).trim() : undefined,
  description: body.description !== undefined ? String(body.description).trim() : undefined,
  categoryId: body.categoryId !== undefined ? String(body.categoryId).trim() : undefined,
  location: body.location !== undefined ? String(body.location).trim() : undefined,
  eventDate: body.eventDate !== undefined ? String(body.eventDate).trim() : undefined,
  startTime: body.startTime !== undefined ? String(body.startTime).trim() : undefined,
  roles: Array.isArray(body.roles) ? body.roles.map(toGigRoleInput) : undefined,
  status: body.status,
});

export const toBrowseGigsQueryDTO = (query: any): BrowseGigsQueryDTO => ({
  search: query.search !== undefined ? String(query.search).trim() : undefined,
  categoryId: query.categoryId !== undefined ? String(query.categoryId).trim() : undefined,
  location: query.location !== undefined ? String(query.location).trim() : undefined,
  minPay: query.minPay !== undefined ? Number(query.minPay) : undefined,
  date: query.date !== undefined ? String(query.date).trim() : undefined,
});

export const toAdminGigsQueryDTO = (query: any): AdminGigsQueryDTO => ({
  search: query.search !== undefined ? String(query.search).trim() : undefined,
  categoryId: query.categoryId !== undefined ? String(query.categoryId).trim() : undefined,
  status: query.status !== undefined ? String(query.status).trim() : undefined,
  date: query.date !== undefined ? String(query.date).trim() : undefined,
  page: query.page !== undefined ? Number(query.page) : 1,
  limit: query.limit !== undefined ? Number(query.limit) : 10,
});

export const toApplyForGigRoleRequestDTO = (body: any): ApplyForGigRoleRequestDTO => ({
  roleId: String(body.roleId || "").trim(),
});

export const toUpdateApplicationStatusRequestDTO = (body: any): UpdateApplicationStatusRequestDTO => ({
  status: body.status,
});
