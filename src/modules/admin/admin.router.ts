import { Router } from "express";
import { AdminController } from "./admin.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";

const router = Router();

// Public endpoint for homepage stats (no auth required)
router.get("/stats/public", AdminController.getPublicStats);

// Admin-only detailed stats
router.get("/stats", authMiddleware(UserRole.ADMIN), AdminController.getStats);

export const AdminRoutes = router;
