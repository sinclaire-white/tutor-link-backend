import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import catchAsync from "../utils/catchAsync";
import { prisma } from "../lib/prisma";

export enum UserRole {
  STUDENT = "STUDENT",
  TUTOR = "TUTOR",
  ADMIN = "ADMIN",
}

const authMiddleware = (...roles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // Check Authentication
    if (!session || !session.user) {
      throw new AppError(401, "You are not an authorized user");
    }

    // Check Email Verification
    // if (!session.user.emailVerified) {
    //   throw new AppError(403, "Please verify your email.");
    // }

    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isSuspended: true, role: true },
    });

    if (!user) {
      throw new AppError(401, "User not found");
    }

    if (user.isSuspended) {
      throw new AppError(403, "Your account has been suspended. Contact support.");
    }

    // Check Roles
    const userRole = user.role as UserRole;

    if (roles.length && !roles.includes(userRole)) {
      throw new AppError(403, "You do not have permission to access this resource.");
    }

    // Attach user to Request object
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: userRole, 
      emailVerified: session.user.emailVerified,
    };

    next();
  });
};

export default authMiddleware;