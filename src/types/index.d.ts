import { UserRole } from "../middlewares/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      //ensures req.user always exists and looks like this
      user: {
        id: string;
        role: UserRole;
        email: string;
      };
    }
  }
}