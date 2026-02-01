import { prisma } from "../../lib/prisma";
import { BookingStatus } from "../../../generated/prisma/enums";

const createReview = async (
  studentId: string,
  payload: { bookingId: string; rating: number; comment: string },
) => {
  // Check if the booking exists and belongs to this student
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { review: true },
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (booking.studentId !== studentId) {
    throw new Error("YOU_CANNOT_REVIEW_THIS_SESSION");
  }

  // Status Guard: Can only review completed sessions
  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("SESSION_MUST_BE_COMPLETED_TO_REVIEW");
  }

  // Duplicate Guard: Check if already reviewed
  if (booking.review) {
    throw new Error("YOU_ALREADY_REVIEWED_THIS_SESSION");
  }

  // reate the Review using a Transaction
  // This ensures data integrity in case of future expansions
  return await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        bookingId: payload.bookingId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    return review;
  });
};

const getTutorReviews = async (tutorId: string) => {
  //  find reviews where the booking's tutorId matches
  return await prisma.review.findMany({
    where: {
      booking: {
        tutorId: tutorId,
      },
    },
    include: {
      booking: {
        include: {
          student: { select: { name: true, image: true } },
        },
      },
    },
  });
};

export const ReviewService = { createReview, getTutorReviews };
