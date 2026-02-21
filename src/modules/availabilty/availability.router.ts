import { Router } from "express";
import { AvailabilityController } from "./availability.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateStatus";
import { AvailabilityValidation } from "./availability.validation";

const router: Router = Router();

// Public: Anyone can see a tutor's schedule 
router.get("/:tutorId", AvailabilityController.getTutorAvailability);

// Private: Only Tutors can edit their own schedule 
router.put(
  "/my-slots",
  authMiddleware(UserRole.TUTOR),
  validateRequest(AvailabilityValidation.updateAvailabilityZod),
  AvailabilityController.updateMyAvailability
);

export const AvailabilityRoutes = router;