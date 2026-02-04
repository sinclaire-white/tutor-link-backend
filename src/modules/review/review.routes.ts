import { Router } from "express";
import { ReviewController } from "./review.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";
import { ReviewValidation } from "./review.validation";
import validateRequest from "../../middlewares/validateStatus";

const router: Router = Router();

// Protected: Only STUDENTs can create reviews
router.post(
  "/",
  authMiddleware(UserRole.STUDENT),
  validateRequest(ReviewValidation.createReviewZod),
  ReviewController.createReview,
);

// Public: Anyone can view reviews for a tutor
router.get("/:tutorId", ReviewController.getTutorReviews);

export const ReviewRoutes = router;
