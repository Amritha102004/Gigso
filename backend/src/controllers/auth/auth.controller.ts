import type { Request, Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import type { IAuthService } from "../../interfaces/services/auth/auth.service.interface";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../../utils/cookie";
import { HttpStatus } from "../../utils/http-status.enum";
import { MESSAGES } from "../../constants/messages";
import type { ApiResponse } from "../../types/api-response.type";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  toRegisterUserRequestDTO,
  toLoginUserRequestDTO,
  toVerifyOtpRequestDTO,
  toResendOtpRequestDTO,
  toResetPasswordRequestDTO,
  toChangePasswordRequestDTO,
  toGoogleLoginRequestDTO,
} from "../../mappers/request.mapper";
import type { UserResponseDTO } from "../../dtos/user.dto";

export class AuthController {
  constructor(private _authService: IAuthService) {}

  public signup = asyncHandler(async (req: Request, res: Response) => {
    const dto = toRegisterUserRequestDTO(req.body);

    await this._authService.sendRegistrationOtp(dto);

    const response: ApiResponse = {
      success: true,
      message: `${MESSAGES.OTP_SENT} to ${dto.email}`,
    };
    res.status(HttpStatus.OK).json(response);
  });

  public verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const dto = toVerifyOtpRequestDTO(req.body);

    const result = await this._authService.verifyOtp(dto.email, dto.otp, dto.type);

    if (dto.type === "registration") {
      const user = result as UserResponseDTO;
      const response: ApiResponse = {
        success: true,
        message: MESSAGES.USER_CREATED,
        data: { user },
      };
      res.status(HttpStatus.CREATED).json(response);
    } else {
      const response: ApiResponse = {
        success: true,
        message: MESSAGES.OTP_VERIFY_SUCCESS,
      };
      res.status(HttpStatus.OK).json(response);
    }
  });

  public resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const dto = toResendOtpRequestDTO(req.body);

    await this._authService.resendOtp(dto.email, dto.type);

    const response: ApiResponse = {
      success: true,
      message: `${MESSAGES.OTP_RESEND_SUCCESS} to ${dto.email}`,
    };
    res.status(HttpStatus.OK).json(response);
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const dto = toLoginUserRequestDTO(req.body);

    const { user, accessToken, refreshToken } = await this._authService.login(dto);

    setRefreshTokenCookie(res, refreshToken);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      data: { accessToken, user },
    };
    res.status(HttpStatus.OK).json(response);
  });

  public googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const dto = toGoogleLoginRequestDTO(req.body);

    try {
      const { user, accessToken, refreshToken } = await this._authService.googleLogin(dto.credential, dto.role);

      setRefreshTokenCookie(res, refreshToken);

      const response: ApiResponse = {
        success: true,
        message: MESSAGES.GOOGLE_LOGIN_SUCCESS,
        data: { accessToken, user },
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === MESSAGES.ROLE_REQUIRED) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message, data: { requiresRole: true } });
        return;
      }
      throw error;
    }
  });

  public refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: MESSAGES.NO_REFRESH_TOKEN });
      return;
    }

    const tokens = await this._authService.refreshTokens(refreshToken);

    setRefreshTokenCookie(res, tokens.refreshToken);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.TOKEN_REFRESHED,
      data: { accessToken: tokens.accessToken },
    };
    res.status(HttpStatus.OK).json(response);
  });

  public forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    await this._authService.forgotPassword(email);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.FORGOT_PASSWORD_SENT,
    };
    res.status(HttpStatus.OK).json(response);
  });

  public resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const dto = toResetPasswordRequestDTO(req.body);
    const { email } = req.body;

    await this._authService.resetPassword(email, dto.token, dto.newPassword);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.PASSWORD_RESET_SUCCESS,
    };
    res.status(HttpStatus.OK).json(response);
  });

  public logout = asyncHandler(async (req: Request, res: Response) => {
    clearRefreshTokenCookie(res);
    const response: ApiResponse = {
      success: true,
      message: MESSAGES.LOGOUT_SUCCESS,
    };
    res.status(HttpStatus.OK).json(response);
  });

  public changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const dto = toChangePasswordRequestDTO(req.body);
    const userId = req.user!._id.toString();

    await this._authService.changePassword(userId, dto.currentPassword, dto.newPassword);

    const response: ApiResponse = {
      success: true,
      message: "Password changed successfully",
    };
    res.status(HttpStatus.OK).json(response);
  });
}
