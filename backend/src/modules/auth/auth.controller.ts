import { Request, Response } from "express";
import { IAuthService } from "./auth.service";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../../utils/cookie";

export class AuthController {
  constructor(private authService: IAuthService) {}

  public async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;
      
      if (!name || !email || !password || !role) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      await this.authService.sendRegistrationOtp({ name, email, password, role });
      
      res.status(200).json({ message: `OTP sent successfully to ${email}` });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to initiate signup" });
    }
  }

  public async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, type } = req.body;
      
      if (!email || !otp || !type) {
        res.status(400).json({ error: "Email, OTP and type are required" });
        return;
      }

      if (type !== 'registration' && type !== 'password-reset') {
        res.status(400).json({ error: "Invalid OTP type" });
        return;
      }

      const result = await this.authService.verifyOtp(email, String(otp), type);

      if (type === 'registration') {
        const user = result as any; 
        const userResponse = {
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          isProfileCompleted: user.isProfileCompleted,
        };

        res.status(201).json({ 
          message: "User registered successfully",
          user: userResponse
        });
      } else {
        res.status(200).json({ message: "OTP verified successfully. Proceed to reset password." });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message || "OTP verification failed" });
    }
  }

  public async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, type } = req.body;

      if (!email || !type) {
        res.status(400).json({ error: "Email and type are required" });
        return;
      }

      if (type !== 'registration' && type !== 'password-reset') {
        res.status(400).json({ error: "Invalid OTP type" });
        return;
      }

      await this.authService.resendOtp(email, type);

      res.status(200).json({ message: `New OTP sent successfully to ${email}` });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to resend OTP" });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const { user, accessToken, refreshToken } = await this.authService.login(email, password);

      setRefreshTokenCookie(res, refreshToken);

      const userResponse = {
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isProfileCompleted: user.isProfileCompleted,
      };

      res.status(200).json({
        message: "Login successful",
        accessToken,
        user: userResponse,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Login failed" });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        res.status(401).json({ error: "No refresh token provided" });
        return;
      }

      const tokens = await this.authService.refreshTokens(refreshToken);

      setRefreshTokenCookie(res, tokens.refreshToken);

      res.status(200).json({ accessToken: tokens.accessToken });
    } catch (error: any) {
      res.status(403).json({ error: error.message || "Invalid refresh token" });
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      await this.authService.forgotPassword(email);

      res.status(200).json({ message: "If your email is registered, you will receive an OTP." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Forgot password operation failed" });
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;
      
      if (!email || !otp || !newPassword) {
        res.status(400).json({ error: "Email, OTP and new password are required" });
        return;
      }

      await this.authService.resetPassword(email, String(otp), newPassword);

      res.status(200).json({ message: "Password reset successful" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Reset password failed" });
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    clearRefreshTokenCookie(res);
    res.status(200).json({ message: "Logged out successfully" });
  }
}
