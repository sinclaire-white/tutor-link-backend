import { Router } from "express";
import { AvailabilityController } from "./availability.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";

const router: Router = Router();

// Public: Students can view a tutor's availability before booking 
router.get("/:tutorId", AvailabilityController.getTutorAvailability);

// Private: Tutors manage their own slots 
router.put(
  "/my-slots",
  authMiddleware(UserRole.TUTOR),
  AvailabilityController.updateMyAvailability
);

export const AvailabilityRoutes = router;