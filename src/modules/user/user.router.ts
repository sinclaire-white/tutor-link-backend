import { Router } from "express";
import { UserController } from "./user.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateStatus";
import { UserValidation } from "./user.vaidation";

const router: Router = Router();

// protected:Get my own profile (Dashboard data)
router.get("/me", 
    authMiddleware(), 
    UserController.getMyProfile
);

// Update my basic info
router.patch("/me", 
    authMiddleware(), 
     validateRequest(UserValidation.updateUserProfileZod),
    UserController.updateMyProfile
);

// Admin: list users
router.get("/", authMiddleware(UserRole.ADMIN), UserController.listUsers);

// Admin: suspend/unsuspend a user
router.patch("/:id/suspend", authMiddleware(UserRole.ADMIN), UserController.suspendUser);

export const UserRoutes = router;
