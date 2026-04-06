import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { OtpRepository } from "../otp/otp.repository";

const router = Router();

const otpRepository = new OtpRepository();
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository, otpRepository);
const authController = new AuthController(authService);

router.post("/signup", authController.signup.bind(authController));
router.post("/verify-otp", authController.verifyOtp.bind(authController));
router.post("/resend-otp", authController.resendOtp.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/google", authController.googleLogin.bind(authController));
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.post("/forgot-password", authController.forgotPassword.bind(authController));
router.post("/reset-password", authController.resetPassword.bind(authController));
router.post("/logout", authController.logout.bind(authController));

export const authRoutes = router;
