import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { HttpStatus } from "../utils/http-status.enum";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: "User not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(HttpStatus.FORBIDDEN).json({ error: "Access forbidden: insufficient permissions" });
      return;
    }

    next();
  };
};
