import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../errors/AppError";
import { IBookingParams } from "./booking.interface";

/**
 * Validates that the booking ID is present.
 * This function acts as a 'Type Guard'.
 */
const validateId = (id: string | undefined): string => {
  if (!id) {
    throw new AppError(400, "Booking ID is required");
  }
  return id;
};

// Wraps logic in catchAsync to forward errors to the globalErrorHandler
const createBooking = catchAsync(async (req: Request, res: Response) => {
  // Create booking with studentId from authenticated user
  const result = await BookingService.createBooking({
    ...req.body,
    studentId: req.user.id, // user object is attached by authMiddleware
    scheduledAt: new Date(req.body.scheduledAt),
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking requested successfully!",
    data: result,
  });
});

// getting bookings for the logged-in user (student or tutor)
const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getMyBookings(req.user.id, req.user.role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings fetched successfully",
    data: result,
  });
});

// Admin: fetch all bookings with related user info
const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const { page, perPage, q } = req.query as { page?: string; perPage?: string; q?: string };
  const p = page ? parseInt(page, 10) : 1;
  const pp = perPage ? parseInt(perPage, 10) : 10;
  const result = await BookingService.getAllBookings({ page: p, perPage: pp, q });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All bookings fetched successfully",
    data: result,
  });
});

// updating the status of a booking
const updateStatus = catchAsync(
  async (req: Request<IBookingParams>, res: Response) => {
    const id = validateId(req.params.id);
    const { status } = req.body;
    const requesterId = req.user!.id;
    const requesterRole = req.user!.role;

    const result = await BookingService.updateBookingStatus(id, status, requesterId, requesterRole);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Status updated successfully",
      data: result,
    });
  },
);

export const BookingController = { 
  createBooking, 
  getMyBookings, 
  updateStatus,
  getAllBookings
 };

