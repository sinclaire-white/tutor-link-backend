import { prisma } from "../../lib/prisma";
import { BookingStatus, Day } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { ICreateBookingPayload } from "./booking.interface";

// helper to find a booking or throw 404 error
const findBookingOrThrow = async (id: string) => {
  const result = await prisma.booking.findUnique({
    where: { id },
    include: {
      student: { select: { name: true, email: true } },
      tutor: { select: { name: true, email: true } },
    },
  });
  if (!result) throw new AppError(404, "Booking not found");
  return result;
};

//  creating a new booking request
const createBooking = async (payload: ICreateBookingPayload) => {
  const { studentId, tutorId, scheduledAt } = payload;

  // A user should not be able to hire themselves as a tutor.
  if (studentId === tutorId) {
    throw new AppError(400, "YOU_CANNOT_BOOK_YOURSELF");
  }

  // get the Tutor's Profile ID to check their availability slots.
  const tutorProfile = await prisma.tutor.findUnique({
    where: { userId: tutorId },
  });

  if (!tutorProfile) {
    throw new AppError(404, "TUTOR_NOT_FOUND");
  }

  // check if the tutor actually works on the day the student selected.
  const dayNames: Day[] = [
    Day.SUNDAY,
    Day.MONDAY,
    Day.TUESDAY,
    Day.WEDNESDAY,
    Day.THURSDAY,
    Day.FRIDAY,
    Day.SATURDAY,
  ];
  const dayOfBooking = dayNames[scheduledAt.getDay()];
  
  if (!dayOfBooking) {
    throw new AppError(400, "INVALID_BOOKING_DATE");
  }

  const isAvailable = await prisma.availability.findFirst({
    where: {
      tutorId: tutorProfile.id,
      dayOfWeek: dayOfBooking,
    },
  });

  if (!isAvailable) {
    throw new AppError(400, "TUTOR_IS_NOT_AVAILABLE_ON_THIS_DAY");
  }

  // Check if there is already a PENDING or CONFIRMED booking for this tutor at this exact time.
  const existingBooking = await prisma.booking.findFirst({
    where: {
      tutorId: tutorId,
      scheduledAt: scheduledAt,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
    },
  });

  if (existingBooking) {
    throw new AppError(409, "THIS_TIMESLOT_IS_ALREADY_TAKEN");
  }

  // If all guards pass, save the booking to the database.
  return await prisma.booking.create({
    data: payload,
    include: {
      tutor: { select: { name: true, email: true } },
      category: {
        select: { name: true },
      },
    },
  });
};

//  fetching bookings based on who is asking
const getMyBookings = async (userId: string, role: string) => {
  // If TUTOR, filter by tutorId. If STUDENT, filter by studentId.
  const whereCondition =
    role === "TUTOR" ? { tutorId: userId } : { studentId: userId };

  return await prisma.booking.findMany({
    where: whereCondition,
    include: {
      student: {
        select: { name: true, email: true, image: true },
      },
      tutor: {
        select: { name: true, email: true, image: true },
      },
      category: {
        select: { name: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });
};

//    updating the status (Accepting, Completing, Cancelling)
const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
) => {
  await findBookingOrThrow(bookingId); // Ensure booking exists
  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
};

export const BookingService = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
};