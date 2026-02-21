import { UserRole } from "../middlewares/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      // Augments Express Request to include the user injected by authMiddleware
      user: {
        id: string;
        role: UserRole;
        email: string;
        name: string;
        emailVerified: boolean;
      };
    }
  }
}