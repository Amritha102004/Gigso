import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { UserRepository } from "../repositories/user.repository";
import { OtpRepository } from "../repositories/otp.repository";
import { EmailService } from "../services/email.service";
import { ENV } from "../config/env.config";

import { validate } from "../middlewares/validate.middleware";
import { signupSchema, loginSchema, verifyOtpSchema, resendOtpSchema, googleLoginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/auth.validation";

const router = Router();

const otpRepository = new OtpRepository();
const authRepository = new UserRepository();
const emailService = new EmailService();

const authService = new AuthService(
  authRepository, 
  otpRepository, 
  emailService, 
  ENV.GOOGLE_CLIENT_ID || ""
);
const authController = new AuthController(authService);

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), authController.resendOtp);
router.post("/login", validate(loginSchema), authController.login);
router.post("/google", validate(googleLoginSchema), authController.googleLogin);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.post("/logout", authController.logout);

export const authRoutes = router;
