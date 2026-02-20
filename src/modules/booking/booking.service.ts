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
  const { studentId, tutorId, scheduledAt, duration = 1 } = payload;

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

  if (!tutorProfile.isApproved) {
    throw new AppError(400, "TUTOR_NOT_APPROVED");
  }

  // Booking time must be in future (at least 1 hour ahead)
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  if (new Date(scheduledAt) < oneHourFromNow) {
    throw new AppError(400, "BOOKING_MUST_BE_AT_LEAST_1_HOUR_AHEAD");
  }

  // Calculate booking start and end based on duration
  const bookingStart = new Date(scheduledAt);
  const bookingEnd = new Date(bookingStart.getTime() + duration * 60 * 60 * 1000);

  // Student cannot have overlapping bookings
  const studentOverlap = await prisma.booking.findFirst({
    where: {
      studentId,
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      OR: [
        {
          // Existing booking starts before new booking ends AND ends after new booking starts
          AND: [
            { scheduledAt: { lt: bookingEnd } },
            { scheduledAt: { gte: bookingStart } },
          ],
        },
      ],
    },
  });

  if (studentOverlap) {
    throw new AppError(409, "YOU_HAVE_ANOTHER_BOOKING_AT_THIS_TIME");
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

  const availabilitySlot = await prisma.availability.findFirst({
    where: {
      tutorId: tutorProfile.id,
      dayOfWeek: dayOfBooking,
    },
  });

  if (!availabilitySlot) {
    throw new AppError(400, "TUTOR_IS_NOT_AVAILABLE_ON_THIS_DAY");
  }

  // Validate that booking time fits within availability slot
  const bookingHour = bookingStart.getHours();
  const bookingMinute = bookingStart.getMinutes();
  const bookingEndHour = bookingEnd.getHours();
  const bookingEndMinute = bookingEnd.getMinutes();

  const [slotStartHour, slotStartMinute] = availabilitySlot.startTime.split(":").map(Number);
  const [slotEndHour, slotEndMinute] = availabilitySlot.endTime.split(":").map(Number);

  const bookingStartMinutes = bookingHour * 60 + bookingMinute;
  const bookingEndMinutes = bookingEndHour * 60 + bookingEndMinute;
  const slotStartMinutes = slotStartHour * 60 + slotStartMinute;
  const slotEndMinutes = slotEndHour * 60 + slotEndMinute;

  if (bookingStartMinutes < slotStartMinutes || bookingEndMinutes > slotEndMinutes) {
    throw new AppError(400, "BOOKING_TIME_OUTSIDE_AVAILABILITY_SLOT");
  }

  // Check if there is already a PENDING or CONFIRMED booking for this tutor that overlaps
  const tutorOverlap = await prisma.booking.findFirst({
    where: {
      tutorId: tutorId,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
      OR: [
        {
          // Check if existing booking overlaps with new booking
          AND: [
            { scheduledAt: { lt: bookingEnd } },
            { scheduledAt: { gte: bookingStart } },
          ],
        },
      ],
    },
  });

  if (tutorOverlap) {
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
        select: { id: true, name: true, email: true, image: true },
      },
      tutor: {
        select: { id: true, name: true, email: true, image: true },
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
  // Admin: fetch all bookings with student and tutor info
  getAllBookings: async (opts?: {
    page?: number;
    perPage?: number;
    q?: string;
  }) => {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const perPage = opts?.perPage && opts.perPage > 0 ? opts.perPage : 10;
    const where: any = {};
    if (opts?.q) {
      where.OR = [
        { student: { name: { contains: opts.q, mode: "insensitive" } } },
        { tutor: { name: { contains: opts.q, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, email: true } },
          tutor: { select: { id: true, name: true, email: true } },
          category: { select: { name: true } },
        },
        orderBy: { scheduledAt: "asc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.booking.count({ where }),
    ]);

    return { items, total, page, perPage };
  },
};
