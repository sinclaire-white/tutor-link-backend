import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { prisma } from "../../lib/prisma";
import { BookingStatus, UserRole } from "../../../generated/prisma/enums";

// Public stats for homepage (no auth required)
const getPublicStats = catchAsync(async (req: Request, res: Response) => {
  const totalUsers = await prisma.user.count();
  const totalTutors = await prisma.tutor.count({ where: { isApproved: true } });
  const completedBookings = await prisma.booking.count({ 
    where: { status: BookingStatus.COMPLETED } 
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Public stats fetched",
    data: { 
      totalUsers,
      totalTutors,
      completedBookings,
    },
  });
});

// Admin-only detailed stats
const getStats = catchAsync(async (req: Request, res: Response) => {
  const totalUsers = await prisma.user.count();
  const tutorsCount = await prisma.tutor.count();
  const studentsCount = await prisma.user.count({ where: { role: UserRole.STUDENT } });
  
  const totalBookings = await prisma.booking.count();
  const completedBookings = await prisma.booking.count({ 
    where: { status: BookingStatus.COMPLETED } 
  });
  const pendingBookings = await prisma.booking.count({ 
    where: { status: BookingStatus.PENDING } 
  });
  const cancelledBookings = await prisma.booking.count({ 
    where: { status: BookingStatus.CANCELLED } 
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin stats fetched",
    data: { 
      users: totalUsers, 
      tutors: tutorsCount, 
      students: studentsCount,
      bookings: totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings 
    },
  });
});

export const AdminController = { getStats, getPublicStats };
