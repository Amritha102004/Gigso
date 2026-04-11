import { Request, Response } from "express";
import { IAuthService } from "./auth.service";
import { IUser } from "../../interfaces/user.interface";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../../utils/cookie";
import { HttpStatus } from "../../utils/http-status.enum";

/** Helper to extract a message from an unknown caught value */
const errMsg = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

/** Strips password and internal fields before sending to client */
const toUserResponse = (user: IUser) => ({
  name: user.name,
  email: user.email,
  role: user.role,
  isApproved: user.isApproved,
  isProfileCompleted: user.isProfileCompleted,
});

export class AuthController {
  constructor(private _authService: IAuthService) {}

  public async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "All fields are required" });
        return;
      }

      await this._authService.sendRegistrationOtp({ name, email, password, role });

      res.status(HttpStatus.OK).json({ message: `OTP sent successfully to ${email}` });
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: errMsg(error, "Failed to initiate signup") });
    }
  }

  public async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, type } = req.body;

      if (!email || !otp || !type) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Email, OTP and type are required" });
        return;
      }

      if (type !== "registration" && type !== "password-reset") {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid OTP type" });
        return;
      }

      const result = await this._authService.verifyOtp(email, String(otp), type);

      if (type === "registration") {
        const user = result as IUser;
        res.status(HttpStatus.CREATED).json({
          message: "User registered successfully",
          user: toUserResponse(user),
        });
      } else {
        res.status(HttpStatus.OK).json({ message: "OTP verified successfully. Proceed to reset password." });
      }
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: errMsg(error, "OTP verification failed") });
    }
  }

  public async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, type } = req.body;

      if (!email || !type) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Email and type are required" });
        return;
      }

      if (type !== "registration" && type !== "password-reset") {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid OTP type" });
        return;
      }

      await this._authService.resendOtp(email, type);

      res.status(HttpStatus.OK).json({ message: `New OTP sent successfully to ${email}` });
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: errMsg(error, "Failed to resend OTP") });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Email and password are required" });
        return;
      }

      const { user, accessToken, refreshToken } = await this._authService.login(email, password);

      setRefreshTokenCookie(res, refreshToken);

      res.status(HttpStatus.OK).json({
        message: "Login successful",
        accessToken,
        user: toUserResponse(user),
      });
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: errMsg(error, "Login failed") });
    }
  }

  public async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { token, role } = req.body;

      if (!token) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Google token is required" });
        return;
      }

      const { user, accessToken, refreshToken } = await this._authService.googleLogin(token, role);

      setRefreshTokenCookie(res, refreshToken);

      res.status(HttpStatus.OK).json({
        message: "Google login successful",
        accessToken,
        user: toUserResponse(user),
      });
    } catch (error: unknown) {
      const message = errMsg(error, "Google login failed");
      if (message === "Role must be selected before Google login.") {
        res.status(HttpStatus.BAD_REQUEST).json({ error: message, requiresRole: true });
        return;
      }
      res.status(HttpStatus.BAD_REQUEST).json({ error: message });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: "No refresh token provided" });
        return;
      }

      const tokens = await this._authService.refreshTokens(refreshToken);

      setRefreshTokenCookie(res, tokens.refreshToken);

      res.status(HttpStatus.OK).json({ accessToken: tokens.accessToken });
    } catch (error: unknown) {
      res.status(HttpStatus.FORBIDDEN).json({ error: errMsg(error, "Invalid refresh token") });
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Email is required" });
        return;
      }

      await this._authService.forgotPassword(email);

      res.status(HttpStatus.OK).json({ message: "If your email is registered, you will receive an OTP." });
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: errMsg(error, "Forgot password operation failed") });
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Email, OTP and new password are required" });
        return;
      }

      await this._authService.resetPassword(email, String(otp), newPassword);

      res.status(HttpStatus.OK).json({ message: "Password reset successful" });
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: errMsg(error, "Reset password failed") });
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    clearRefreshTokenCookie(res);
    res.status(HttpStatus.OK).json({ message: "Logged out successfully" });
  }
}
