import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";

export enum UserRole {
  STUDENT = "STUDENT",
  TUTOR = "TUTOR",
  ADMIN = "ADMIN",
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        emailVerified: boolean;
      };
    }
  }
}

const authMiddleware = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      // Check if the user is authenticated
      if (!session || !session.user) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized user",
        });
      }
      // Check if the user's email is verified
      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email.",
        });
      }
      // Check if the user has the required roles
      if (roles.length && !roles.includes(session.user.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource.",
        });
      }
      // attach user info to the request object
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified,
      };
      next();
    } catch (err) {
      res.status(401).json({ error: "Unauthorized" });
      next(err);
    }
  };
};
export default authMiddleware;