import { Router } from "express";
import { UserController } from "./user.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const router: Router = Router();

// Get my own profile (Dashboard data)
router.get("/me", authMiddleware(), UserController.getMyProfile);

// Update my basic info
router.patch("/me", authMiddleware(), UserController.updateMyProfile);

export const UserRoutes = router;
