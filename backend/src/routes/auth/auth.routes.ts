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

import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";

// Profile image upload endpoint
import { uploadProfileImage } from "../../middlewares/upload.middleware";
import { uploadToCloudinary } from "../../utils/cloudinary";

router.post("/upload-image", authenticateJWT, (req: AuthRequest, res: Response) => {
  uploadProfileImage(req, res, async (err: unknown) => {
    if (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to parse file";
      return res.status(400).json({ success: false, message: errorMsg });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    try {
      const secureUrl = await uploadToCloudinary(req.file.path);
      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: { url: secureUrl },
      });
    } catch (uploadError: unknown) {
      console.error("Cloudinary upload failed:", uploadError);
      const errorMsg = uploadError instanceof Error ? uploadError.message : "Failed to upload image to Cloudinary";
      res.status(500).json({
        success: false,
        message: errorMsg,
      });
    }
  });
});

export const authRoutes = router;
