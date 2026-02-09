import { Router } from "express";
import { AdminController } from "./admin.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/stats", authMiddleware(UserRole.ADMIN), AdminController.getStats);

export const AdminRoutes = router;
