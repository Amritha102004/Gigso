import { Request, Response } from "express";
import { IAuthService } from "../interfaces/services/auth.service.interface";
import { IUser } from "../interfaces/user.interface";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../utils/cookie";
import { HttpStatus } from "../utils/http-status.enum";
import { toUserResponse } from "../mappers/user.mapper";
import { MESSAGES } from "../constants/messages";
import { ApiResponse } from "../types/api-response.type";
import { asyncHandler } from "../utils/asyncHandler";

export class AuthController {
  constructor(private _authService: IAuthService) {}

  public signup = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    await this._authService.sendRegistrationOtp({ name, email, password, role });

    const response: ApiResponse = {
      success: true,
      message: `${MESSAGES.OTP_SENT} to ${email}`,
    };
    res.status(HttpStatus.OK).json(response);
  });

  public verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, type } = req.body;

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
  });

  public resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, type } = req.body;

    await this._authService.resendOtp(email, type);

    const response: ApiResponse = {
      success: true,
      message: `New OTP sent successfully to ${email}`,
    };
    res.status(HttpStatus.OK).json(response);
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await this._authService.login(email, password);

    setRefreshTokenCookie(res, refreshToken);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      data: { accessToken, user: toUserResponse(user) },
    };
    res.status(HttpStatus.OK).json(response);
  });

  public googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { token, role } = req.body;

    try {
      const { user, accessToken, refreshToken } = await this._authService.googleLogin(token, role);

      setRefreshTokenCookie(res, refreshToken);

      const response: ApiResponse = {
        success: true,
        message: "Google login successful",
        data: { accessToken, user: toUserResponse(user) },
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error: any) {
      if (error.message === "Role must be selected before Google login.") {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message, data: { requiresRole: true } });
        return;
      }
      throw error;
    }
  });

  public refreshToken = asyncHandler(async (req: Request, res: Response) => {
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
  });

  public forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    await this._authService.forgotPassword(email);

    const response: ApiResponse = {
      success: true,
      message: "If your email is registered, you will receive an OTP.",
    };
    res.status(HttpStatus.OK).json(response);
  });

  public resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    await this._authService.resetPassword(email, String(otp), newPassword);

    const response: ApiResponse = {
      success: true,
      message: "Password reset successful",
    };
    res.status(HttpStatus.OK).json(response);
  });

  public logout = asyncHandler(async (req: Request, res: Response) => {
    clearRefreshTokenCookie(res);
    const response: ApiResponse = {
      success: true,
      message: "Logged out successfully",
    };
    res.status(HttpStatus.OK).json(response);
  });
}
