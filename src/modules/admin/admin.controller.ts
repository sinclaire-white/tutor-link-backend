import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { prisma } from "../../lib/prisma";

const getStats = catchAsync(async (req: Request, res: Response) => {
  const usersCount = await prisma.user.count();
  const tutorsCount = await prisma.tutor.count();
  const bookingsCount = await prisma.booking.count();

  // Revenue is not stored on Booking in current schema; return null for now.
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin stats fetched",
    data: { users: usersCount, tutors: tutorsCount, bookings: bookingsCount, revenue: null },
  });
});

export const AdminController = { getStats };
