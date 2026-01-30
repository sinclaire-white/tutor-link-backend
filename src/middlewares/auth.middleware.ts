import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";
import sendResponse from "../helpers/sendResponse"; 

export enum UserRole {
  STUDENT = "STUDENT",
  TUTOR = "TUTOR",
  ADMIN = "ADMIN",
}

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

      // Check Authentication
      if (!session || !session.user) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "You are not an authorized user",
          data: null, // Passes null because sendResponse expects 'data'
        });
      }

      // Check Email Verification
      if (!session.user.emailVerified) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Please verify your email.",
          data: null,
        });
      }

      // Check Roles
      if (roles.length && !roles.includes(session.user.role as UserRole)) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "You do not have permission to access this resource.",
          data: null,
        });
      }

      // Attach user and move to next
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified,
      };
      
      next();
    } catch (err) {
      // Global Catch Error
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized session or server error",
        data: null,
      });
      next(err);
    }
  };
};

export default authMiddleware;