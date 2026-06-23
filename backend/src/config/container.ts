import { UserRepository } from "../repositories/user.repository";
import { OtpRepository } from "../repositories/otp.repository";
import { WorkerProfileRepository } from "../repositories/workerProfile.repository";
import { OwnerProfileRepository } from "../repositories/ownerProfile.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { GigRepository } from "../repositories/gig.repository";
import { GigRoleRepository } from "../repositories/gigRole.repository";
import { ENV } from "./env.config";

// Services
import { EmailService } from "../services/auth/email.service";
import { AuthService } from "../services/auth/auth.service";
import { WorkerProfileService } from "../services/worker/profile.service";
import { OwnerProfileService } from "../services/owner/profile.service";
import { UsersService } from "../services/admin/users.service";
import { OwnerGigService } from "../services/owner/gig.service";
import { AdminCategoryService } from "../services/admin/category.service";

// Controllers
import { AuthController } from "../controllers/auth/auth.controller";
import { WorkerProfileController } from "../controllers/worker/profile.controller";
import { OwnerProfileController } from "../controllers/owner/profile.controller";
import { AdminUsersController } from "../controllers/admin/users.controller";
import { OwnerGigController } from "../controllers/owner/gig.controller";
import { AdminCategoryController } from "../controllers/admin/category.controller";

// Repositories
export const userRepository = new UserRepository();
export const otpRepository = new OtpRepository();
export const workerProfileRepository = new WorkerProfileRepository();
export const ownerProfileRepository = new OwnerProfileRepository();
export const categoryRepository = new CategoryRepository();
export const gigRepository = new GigRepository();
export const gigRoleRepository = new GigRoleRepository();

// Services
export const emailService = new EmailService();
export const authService = new AuthService(
  userRepository,
  otpRepository,
  emailService,
  ENV.GOOGLE_CLIENT_ID || ""
);
export const workerProfileService = new WorkerProfileService(userRepository, workerProfileRepository);
export const ownerProfileService = new OwnerProfileService(userRepository, ownerProfileRepository);
export const usersService = new UsersService(userRepository);
export const ownerGigService = new OwnerGigService(categoryRepository, gigRepository, gigRoleRepository);
export const adminCategoryService = new AdminCategoryService(categoryRepository);

// Controllers
export const authController = new AuthController(authService);
export const workerProfileController = new WorkerProfileController(workerProfileService);
export const ownerProfileController = new OwnerProfileController(ownerProfileService);
export const adminUsersController = new AdminUsersController(usersService);
export const ownerGigController = new OwnerGigController(ownerGigService);
export const adminCategoryController = new AdminCategoryController(adminCategoryService);
