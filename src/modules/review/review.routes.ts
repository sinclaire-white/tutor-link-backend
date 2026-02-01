import { Router } from "express";
import { ReviewController } from "./review.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";

const router: Router = Router();

router.post(
  "/",
  authMiddleware(UserRole.STUDENT),
  ReviewController.createReview,
);
router.get("/:tutorId", ReviewController.getTutorReviews);

export const ReviewRoutes = router;
