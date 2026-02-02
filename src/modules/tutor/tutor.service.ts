import { BookingStatus } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth.middleware";
import { ITutorRegistration } from "./tutor.interface";

/**
 * Internal helper to find a tutor profile or throw a 404.
 * Fetches associated user and category details for a complete profile view.
 */
const findTutorOrThrow = async (id: string) => {
  const result = await prisma.tutor.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      categories: true, // Included because subject string is now a relation
    },
  });

  if (!result) {
    throw new AppError(404, "Tutor profile not found");
  }
  return result;
};

// Registers a user as a tutor by creating a Tutor profile and updating their role
const registerTutor = async (userId: string, payload: ITutorRegistration) => {
  const { categoryIds, ...tutorData } = payload;

  return await prisma.$transaction(async (tx) => {
    // Update User Role to TUTOR
    await tx.user.update({
      where: { id: userId },
      data: { role: UserRole.TUTOR },
    });

    // Create the specialized Tutor Profile with Category connections
    return await tx.tutor.create({
      data: {
        userId,
        ...tutorData,
        categories: {
          connect: categoryIds.map((id: string) => ({ id })), // Connect categories
        },
      },
      include: { categories: true },
    });
  });
};

// Fetches all tutors along with their associated user and category details
const getAllTutors = async () => {
  return await prisma.tutor.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      categories: true,
    },
  });
};

// Update Tutor Profile and its category links (Used by Tutor or Admin)
const updateTutor = async (id: string, payload: Partial<ITutorRegistration>) => {
  await findTutorOrThrow(id); // Ensure tutor exists
  const { categoryIds, ...updateData } = payload;

  return await prisma.tutor.update({
    where: { id },
    data: {
      ...updateData,
      ...(categoryIds && {
        categories: {
          set: categoryIds.map((cid: string) => ({ id: cid })), // Updates relation links
        },
      }),
    },
  });
};

// This only deletes the Tutor profile, not the User account.
// Deletes the Tutor profile and reverts user role to STUDENT if no active sessions
const deleteTutor = async (id: string) => {
  const tutor = await findTutorOrThrow(id);

  return await prisma.$transaction(async (tx) => {
    // Check for active/upcoming bookings
    const activeBookings = await tx.booking.findFirst({
      where: {
        tutorId: tutor.userId,
        status: {
          in: [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.ONGOING,
          ],
        },
      },
    });

    if (activeBookings) {
      throw new AppError(
        400,
        "Cannot delete profile with active or pending sessions",
      );
    }

    // Revert user role back to STUDENT
    await tx.user.update({
      where: { id: tutor.userId },
      data: { role: UserRole.STUDENT },
    });

    return await tx.tutor.delete({ where: { id } });
  });
};

export const TutorService = {
  registerTutor,
  getAllTutors,
  getSingleTutor: findTutorOrThrow,
  updateTutor,
  deleteTutor,
};
