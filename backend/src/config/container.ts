import { UserRepository } from "../repositories/user.repository";
import { OtpRepository } from "../repositories/otp.repository";
import { WorkerProfileRepository } from "../repositories/workerProfile.repository";
import { OwnerProfileRepository } from "../repositories/ownerProfile.repository";
import { ENV } from "./env.config";

// Services
import { EmailService } from "../services/auth/email.service";
import { AuthService } from "../services/auth/auth.service";
import { WorkerProfileService } from "../services/worker/profile.service";
import { OwnerProfileService } from "../services/owner/profile.service";
import { UsersService } from "../services/admin/users.service";

// Controllers
import { AuthController } from "../controllers/auth/auth.controller";
import { WorkerProfileController } from "../controllers/worker/profile.controller";
import { OwnerProfileController } from "../controllers/owner/profile.controller";
import { AdminUsersController } from "../controllers/admin/users.controller";

// Repositories
export const userRepository = new UserRepository();
export const otpRepository = new OtpRepository();
export const workerProfileRepository = new WorkerProfileRepository();
export const ownerProfileRepository = new OwnerProfileRepository();

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

// Controllers
export const authController = new AuthController(authService);
export const workerProfileController = new WorkerProfileController(workerProfileService);
export const ownerProfileController = new OwnerProfileController(ownerProfileService);
export const adminUsersController = new AdminUsersController(usersService);
