import { Router } from "express";
import { TutorController } from "./tutor.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";
import { TutorValidation } from "./tutor.validation";
import validateRequest from "../../middlewares/validateStatus";

const router: Router = Router();

// Public: Everyone can see the list of tutors
router.get("/", TutorController.getAllTutors);

// Protected: Any logged in user can register to become a tutor
router.post(
  "/register",
  authMiddleware(),
  validateRequest(TutorValidation.createTutorZod), // Just checks if user is logged in
  TutorController.registerTutor,
);

// Public: View a single tutor's details
router.get("/:id", TutorController.getSingleTutor);

// Protected: Only ADMINs and the TUTOR themselves can update or delete tutor profiles
router.patch(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.TUTOR),
  validateRequest(TutorValidation.updateTutorZod),
  TutorController.updateTutor,
);
// Protected: Only ADMINs and the TUTOR themselves can delete tutor profiles
router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.TUTOR),
  TutorController.deleteTutor,
);

// Admin: approve or reject tutor profile
router.patch("/:id/approve", authMiddleware(UserRole.ADMIN), TutorController.setApproval);

export const TutorRoutes = router;
