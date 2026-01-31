import { Router } from "express";
import { TutorController } from "./tutor.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const router: Router = Router();

// Public: Everyone can see the list of tutors
router.get("/", TutorController.getAllTutors);

// Protected: Any logged in user can register to become a tutor
router.post(
  "/register",
  authMiddleware(), // Just checks if user is logged in
  TutorController.registerTutor
);

export const TutorRoutes = router;