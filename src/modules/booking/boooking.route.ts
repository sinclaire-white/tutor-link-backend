import { Router } from "express";
import { BookingController } from "./booking.controller";
import authMiddleware, { UserRole } from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateStatus";
import { BookingValidation } from "./booking.validation";

const router: Router = Router();

// Create a Booking: Only logged-in users can access this.
router.post(
  "/",
  authMiddleware(), 
  validateRequest(BookingValidation.createBookingZod),
  BookingController.createBooking
);

// View My Bookings: Both Students and Tutors use this to see their own history.
router.get(
  "/my-bookings",
  authMiddleware(),
  BookingController.getMyBookings
);

// Update Status: Only Tutors or Admins can change a booking status.
router.patch(
  "/:id/status",
  authMiddleware(UserRole.TUTOR, UserRole.ADMIN),
  validateRequest(BookingValidation.updateBookingStatusZod), 
  BookingController.updateStatus
);

export const BookingRoutes = router;