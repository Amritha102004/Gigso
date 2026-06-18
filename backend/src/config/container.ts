import { UserRepository } from "../repositories/user.repository";
import { OtpRepository } from "../repositories/otp.repository";
import { EmailService } from "../services/email.service";
import { AuthService } from "../services/auth.service";
import { UsersService } from "../services/users.service";
import { AuthController } from "../controllers/auth.controller";
import { AdminUsersController } from "../controllers/users.controller";
import { ENV } from "./env.config";

// Repositories
export const userRepository = new UserRepository();
export const otpRepository = new OtpRepository();

// Services
export const emailService = new EmailService();
export const authService = new AuthService(
  userRepository,
  otpRepository,
  emailService,
  ENV.GOOGLE_CLIENT_ID || ""
);
export const usersService = new UsersService(userRepository);

// Controllers
export const authController = new AuthController(authService);
export const adminUsersController = new AdminUsersController(usersService);
