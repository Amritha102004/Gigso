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

// Profile image upload endpoint
import { uploadProfileImage } from "../../middlewares/upload.middleware";
import { uploadToCloudinary } from "../../utils/cloudinary";

router.post("/upload-image", authenticateJWT, (req: any, res: any) => {
  uploadProfileImage(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
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
    } catch (uploadError: any) {
      console.error("Cloudinary upload failed:", uploadError);
      res.status(500).json({
        success: false,
        message: uploadError.message || "Failed to upload image to Cloudinary",
      });
    }
  });
});

export const authRoutes = router;
