import { Router } from "express";
import { authController } from "../../config/container";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../../validations/auth/auth.validation";

const router = Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), authController.resendOtp);
router.post("/login", validate(loginSchema), authController.login);
router.post("/google", validate(googleLoginSchema), authController.googleLogin);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.post("/change-password", authenticateJWT, validate(changePasswordSchema), authController.changePassword.bind(authController));
router.post("/logout", authController.logout);

export const authRoutes = router;
