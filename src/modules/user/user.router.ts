// user.router.ts
import { Router } from "express";
import { UserController } from "./user.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateStatus";
import { UserValidation } from "./user.vaidation";

const router: Router = Router();

// Protected: Get my own profile (Dashboard data)
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

// Get user by ID (for profile viewing)
router.get("/:id", authMiddleware(), UserController.getUserById);

// Admin: list users (add ?includeSuspended=true to see suspended)
router.get("/", authMiddleware(UserRole.ADMIN), UserController.listUsers);

// Admin: suspend user
router.patch("/:id/suspend", authMiddleware(UserRole.ADMIN), UserController.suspendUser);

// Admin: unsuspend user  
router.patch("/:id/unsuspend", authMiddleware(UserRole.ADMIN), UserController.unsuspendUser);

export const UserRoutes = router;