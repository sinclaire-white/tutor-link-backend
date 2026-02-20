// upload/upload.router.ts
import { Router } from "express";
import { UploadController } from "./upload.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const router: Router = Router();

// Get Cloudinary signature - requires authentication
router.get("/signature", authMiddleware(), UploadController.getSignature);

export const UploadRoutes = router;
