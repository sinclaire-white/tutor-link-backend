import { Router } from "express";
import { AvailabilityController } from "./availability.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";

const router: Router = Router();

// Public: Anyone can see a tutor's schedule 
router.get("/:tutorId", AvailabilityController.getTutorAvailability);

// Private: Only Tutors can edit their own schedule 
router.put(
  "/my-slots",
  authMiddleware(UserRole.TUTOR), // Security Guard
  AvailabilityController.updateMyAvailability
);

export const AvailabilityRoutes = router;