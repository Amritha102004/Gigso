import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UserModel } from "../models/user.model";

export interface AuthRequest extends Request {
  user?: any; 
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Access token is missing or invalid" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token) as { userId: string; role: string };
    
    // Optional: we can fetch the user from DB to ensure they still exist and aren't suspended
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      res.status(401).json({ error: "User associated with token no longer exists" });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ error: "Account is suspended" });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired access token" });
  }
};
