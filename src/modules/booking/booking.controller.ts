import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import sendResponse from "../../helpers/sendResponse";

const createBooking = async (req: Request, res: Response) => {
  try {
    //    Ensure user is authenticated
    if (!req.user) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "You must be logged in",
        data: null,
      });
    }

    // Create booking with studentId from authenticated user
    const result = await BookingService.createBooking({
      ...req.body,
      studentId: req.user.id,
      scheduledAt: new Date(req.body.scheduledAt),
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Booking requested!",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
      data: null,
    });
  }
};

// getting bookings for the logged-in user (student or tutor)
const getMyBookings = async (req: Request, res: Response) => {
  if (!req.user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
      data: null,
    });
  }

  const result = await BookingService.getMyBookings(req.user.id, req.user.role);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings fetched",
    data: result,
  });
};

// updating the status of a booking
const updateStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await BookingService.updateBookingStatus(id as string, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Status updated",
    data: result,
  });
};

export const BookingController = { createBooking, getMyBookings, updateStatus };
