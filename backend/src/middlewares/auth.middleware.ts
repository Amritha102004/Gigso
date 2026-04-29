import { Request, Response, NextFunction } from "express";
import { jwtService } from "../utils/jwt";
import { UserModel } from "../models/user.model";
import { HttpStatus } from "../utils/http-status.enum";
import { MESSAGES } from "../constants/messages";

export interface AuthRequest extends Request {
  user?: any; 
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(HttpStatus.UNAUTHORIZED).json({ error: "Access token is missing or invalid" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwtService.verifyAccessToken(token) as { userId: string; role: string };
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: MESSAGES.USER_NOT_FOUND });
      return;
    }

    if (user.isSuspended) {
      res.status(HttpStatus.FORBIDDEN).json({ error: MESSAGES.USER_SUSPENDED });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(HttpStatus.UNAUTHORIZED).json({ error: "Invalid or expired access token" });
  }
};
