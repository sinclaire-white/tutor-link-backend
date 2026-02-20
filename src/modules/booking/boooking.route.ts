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

// Update Status: Any authenticated user — role-based rules enforced in the service.
router.patch(
  "/:id/status",
  authMiddleware(),
  validateRequest(BookingValidation.updateBookingStatusZod),
  BookingController.updateStatus
);

// Admin: get all bookings
router.get("/", authMiddleware(UserRole.ADMIN), BookingController.getAllBookings);

// View My Bookings: Both Students and Tutors use this
router.get(
  "/my-bookings",
  authMiddleware(), // Should allow any logged-in user, not just specific roles
  BookingController.getMyBookings
);

export const BookingRoutes = router;