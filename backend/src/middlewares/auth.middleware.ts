import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UserModel } from "../models/user.model";
import { HttpStatus } from "../utils/http-status.enum";

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
    const decoded = verifyAccessToken(token) as { userId: string; role: string };
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: "User associated with token no longer exists" });
      return;
    }

    if (user.isSuspended) {
      res.status(HttpStatus.FORBIDDEN).json({ error: "Account is suspended" });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(HttpStatus.UNAUTHORIZED).json({ error: "Invalid or expired access token" });
  }
};
