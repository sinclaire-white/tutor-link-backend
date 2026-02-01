import { Router } from "express";
import { BookingController } from "./booking.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";

const router: Router = Router();

// Create a Booking Only logged-in users can access this.
router.post(
  "/",
  authMiddleware(), 
  BookingController.createBooking
);

// View My Bookings. Both Students and Tutors use this to see their own history.
router.get(
  "/my-bookings",
  authMiddleware(),
  BookingController.getMyBookings
);

// Update Status, Only Tutors or Admins can change a booking to 'CONFIRMED' or 'COMPLETED'.
router.patch(
  "/:id/status",
  authMiddleware(UserRole.TUTOR, UserRole.ADMIN),
  BookingController.updateStatus
);

export const BookingRoutes = router;