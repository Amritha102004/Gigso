import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { HttpStatus } from "../utils/http-status.enum";
import { MESSAGES } from "../constants/messages";

export const requireApproved = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.isApproved) {
    res.status(HttpStatus.FORBIDDEN).json({
      success: false,
      message: MESSAGES.NOT_APPROVED,
    });
    return;
  }
  next();
};
