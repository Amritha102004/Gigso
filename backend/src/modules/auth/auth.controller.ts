import { Request, Response } from "express";
import { IAuthService } from "./auth.service";
import { IUser } from "../../interfaces/user.interface";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../../utils/cookie";
import { HttpStatus } from "../../utils/http-status.enum";
import { toUserResponse } from "../../mappers/user.mapper";
import { MESSAGES } from "../../constants/messages";
import { ApiResponse } from "../../types/api-response.type";

/** Helper to extract a message from an unknown caught value */
const errMsg = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

/** Strips password and internal fields before sending to client */
// const toUserResponse = (user: IUser) => ({
//   name: user.name,
//   email: user.email,
//   role: user.role,
//   isApproved: user.isApproved,
//   isProfileCompleted: user.isProfileCompleted,
// });

export class AuthController {
  constructor(private _authService: IAuthService) {}

  public async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "All fields are required" });
        return;
      }

      await this._authService.sendRegistrationOtp({ name, email, password, role });

      const response: ApiResponse = {
        success: true,
        message: `${MESSAGES.OTP_SENT} to ${email}`,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error: unknown) {
      const message = errMsg(error, "Failed to initiate signup");
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  }

  public async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, type } = req.body;

      if (!email || !otp || !type) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Email, OTP and type are required" });
        return;
      }

      if (type !== "registration" && type !== "password-reset") {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid OTP type" });
        return;
      }

      const result = await this._authService.verifyOtp(email, String(otp), type);

      if (type === "registration") {
        const user = result as IUser;
        const response: ApiResponse = {
          success: true,
          message: MESSAGES.USER_CREATED,
          data: { user: toUserResponse(user) },
        };
        res.status(HttpStatus.CREATED).json(response);
      } else {
        const response: ApiResponse = {
          success: true,
          message: "OTP verified successfully. Proceed to reset password.",
        };
        res.status(HttpStatus.OK).json(response);
      }
    } catch (error: unknown) {
      const message = errMsg(error, "OTP verification failed");
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  }

  public async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, type } = req.body;

      if (!email || !type) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Email and type are required" });
        return;
      }

      if (type !== "registration" && type !== "password-reset") {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid OTP type" });
        return;
      }

      await this._authService.resendOtp(email, type);

      const response: ApiResponse = {
        success: true,
        message: `New OTP sent successfully to ${email}`,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error: unknown) {
      const message = errMsg(error, "Failed to resend OTP");
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Email and password are required" });
        return;
      }

      const { user, accessToken, refreshToken } = await this._authService.login(email, password);

      setRefreshTokenCookie(res, refreshToken);

      const response: ApiResponse = {
        success: true,
        message: MESSAGES.LOGIN_SUCCESS,
        data: { accessToken, user: toUserResponse(user) },
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error: unknown) {
      const message = errMsg(error, "Login failed");
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  }

  public async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { token, role } = req.body;

      if (!token) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Google token is required" });
        return;
      }

      const { user, accessToken, refreshToken } = await this._authService.googleLogin(token, role);

      setRefreshTokenCookie(res, refreshToken);

      const response: ApiResponse = {
        success: true,
        message: "Google login successful",
        data: { accessToken, user: toUserResponse(user) },
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error: unknown) {
      const message = errMsg(error, "Google login failed");
      if (message === "Role must be selected before Google login.") {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message, data: { requiresRole: true } });
        return;
      }
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: "No refresh token provided" });
        return;
      }

      const tokens = await this._authService.refreshTokens(refreshToken);

      setRefreshTokenCookie(res, tokens.refreshToken);

      const response: ApiResponse = {
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken: tokens.accessToken },
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error: unknown) {
      const message = errMsg(error, "Invalid refresh token");
      res.status(HttpStatus.FORBIDDEN).json({ success: false, message });
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Email is required" });
        return;
      }

      await this._authService.forgotPassword(email);

      const response: ApiResponse = {
        success: true,
        message: "If your email is registered, you will receive an OTP.",
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error: unknown) {
      const message = errMsg(error, "Forgot password operation failed");
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Email, OTP and new password are required" });
        return;
      }

      await this._authService.resetPassword(email, String(otp), newPassword);

      const response: ApiResponse = {
        success: true,
        message: "Password reset successful",
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error: unknown) {
      const message = errMsg(error, "Reset password failed");
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    clearRefreshTokenCookie(res);
    const response: ApiResponse = {
      success: true,
      message: "Logged out successfully",
    };
    res.status(HttpStatus.OK).json(response);
  }
}
