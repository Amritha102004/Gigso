import { UserRepository } from "../repositories/user.repository";
import { OtpRepository } from "../repositories/otp.repository";
import { WorkerProfileRepository } from "../repositories/workerProfile.repository";
import { OwnerProfileRepository } from "../repositories/ownerProfile.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { GigRepository } from "../repositories/gig.repository";
import { GigRoleRepository } from "../repositories/gigRole.repository";
import { GigApplicationRepository } from "../repositories/application.repository";
import { NotificationRepository } from "../repositories/notification.repository";
import { MessageRepository } from "../repositories/message.repository";
import { AnnouncementRepository } from "../repositories/announcement.repository";
import { ENV } from "./env.config";

// Services
import { EmailService } from "../services/auth/email.service";
import { AuthService } from "../services/auth/auth.service";
import { WorkerProfileService } from "../services/worker/profile.service";
import { OwnerProfileService } from "../services/owner/profile.service";
import { UsersService } from "../services/admin/users.service";
import { OwnerGigService } from "../services/owner/gig.service";
import { AdminCategoryService } from "../services/admin/category.service";
import { WorkerGigService } from "../services/worker/gig.service";
import { ApplicationService } from "../services/application.service";
import { AdminGigService } from "../services/admin/gig.service";
import { NotificationService } from "../services/notification.service";
import { MessageService } from "../services/message.service";
import { AnnouncementService } from "../services/announcement.service";

// Controllers
import { AuthController } from "../controllers/auth/auth.controller";
import { WorkerProfileController } from "../controllers/worker/profile.controller";
import { OwnerProfileController } from "../controllers/owner/profile.controller";
import { AdminUsersController } from "../controllers/admin/users.controller";
import { OwnerGigController } from "../controllers/owner/gig.controller";
import { AdminCategoryController } from "../controllers/admin/category.controller";
import { WorkerGigController } from "../controllers/worker/gig.controller";
import { ApplicationController } from "../controllers/application.controller";
import { AdminGigController } from "../controllers/admin/gig.controller";
import { NotificationController } from "../controllers/notification.controller";
import { ChatController } from "../controllers/chat.controller";
import { AnnouncementController } from "../controllers/announcement.controller";

// Repositories
export const userRepository = new UserRepository();
export const otpRepository = new OtpRepository();
export const workerProfileRepository = new WorkerProfileRepository();
export const ownerProfileRepository = new OwnerProfileRepository();
export const categoryRepository = new CategoryRepository();
export const gigRepository = new GigRepository();
export const gigRoleRepository = new GigRoleRepository();
export const gigApplicationRepository = new GigApplicationRepository();
export const notificationRepository = new NotificationRepository();
export const messageRepository = new MessageRepository();
export const announcementRepository = new AnnouncementRepository();

// Services
export const notificationService = new NotificationService(notificationRepository);
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
export const ownerGigService = new OwnerGigService(
  categoryRepository,
  gigRepository,
  gigRoleRepository,
  gigApplicationRepository
);
export const adminCategoryService = new AdminCategoryService(categoryRepository);
export const workerGigService = new WorkerGigService(gigRepository, categoryRepository, gigApplicationRepository);
export const applicationService = new ApplicationService(
  gigApplicationRepository,
  gigRepository,
  gigRoleRepository,
  workerProfileRepository,
  notificationService
);
export const adminGigService = new AdminGigService(
  gigRepository,
  workerProfileRepository,
  ownerProfileRepository,
  gigApplicationRepository,
  applicationService
);
export const messageService = new MessageService(
  messageRepository,
  gigRepository,
  userRepository,
  notificationService
);
export const announcementService = new AnnouncementService(
  announcementRepository,
  gigRepository,
  gigApplicationRepository,
  notificationService
);

// Controllers
export const authController = new AuthController(authService);
export const workerProfileController = new WorkerProfileController(workerProfileService);
export const ownerProfileController = new OwnerProfileController(ownerProfileService);
export const adminUsersController = new AdminUsersController(usersService);
export const ownerGigController = new OwnerGigController(ownerGigService);
export const adminCategoryController = new AdminCategoryController(adminCategoryService);
export const workerGigController = new WorkerGigController(workerGigService);
export const applicationController = new ApplicationController(applicationService);
export const adminGigController = new AdminGigController(adminGigService);
export const notificationController = new NotificationController(notificationService);
export const chatController = new ChatController(messageService);
export const announcementController = new AnnouncementController(announcementService);
