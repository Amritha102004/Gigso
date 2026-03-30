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

  public async verifyRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        res.status(400).json({ error: "Email and OTP are required" });
        return;
      }

      const user = await this.authService.verifyRegistrationOtp(email, String(otp));
      
      // Do not return password hash
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
    } catch (error: any) {
      res.status(400).json({ error: error.message || "OTP verification failed" });
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
      // In production we shouldn't leak user existence, but for now we follow the simple throw logic
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
