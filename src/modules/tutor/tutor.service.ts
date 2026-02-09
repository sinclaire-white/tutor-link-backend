import { BookingStatus } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth.middleware";
import { ITutorRegistration, ITutorUpdatePayload } from "./tutor.interface";

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
    const existingTutor = await tx.tutor.findUnique({ where: { userId } });
    if (existingTutor)
      throw new AppError(400, "User is already registered as a tutor");
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
const getAllTutors = async (opts?: { page?: number; perPage?: number; approved?: boolean }) => {
  const page = opts?.page && opts.page > 0 ? opts.page : 1;
  const perPage = opts?.perPage && opts.perPage > 0 ? opts.perPage : 10;
  const where: any = {};
  if (typeof opts?.approved === 'boolean') where.isApproved = opts.approved;

  const [items, total] = await prisma.$transaction([
    prisma.tutor.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true } },
        categories: true,
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tutor.count({ where }),
  ]);

  return { items, total, page, perPage };
};

// Update Tutor Profile and its category links (Used by Tutor or Admin)
const updateTutor = async (id: string, payload: ITutorUpdatePayload) => {
  await findTutorOrThrow(id); // Ensure tutor exists

  const { addCategoryIds, removeCategoryIds, ...updateData } = payload;

  return await prisma.tutor.update({
    where: { id },
    data: {
      ...updateData,
      categories: {
        // connect adds new relations without touching existing ones
        ...(addCategoryIds && {
          connect: addCategoryIds.map((cid) => ({ id: cid })),
        }),
        // disconnect removes specific relations
        ...(removeCategoryIds && {
          disconnect: removeCategoryIds.map((cid) => ({ id: cid })),
        }),
      },
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

const setTutorApproval = async (id: string, approved: boolean) => {
  await findTutorOrThrow(id);
  return await prisma.tutor.update({ where: { id }, data: { isApproved: approved } });
};

export const TutorService = {
  registerTutor,
  getAllTutors,
  getSingleTutor: findTutorOrThrow,
  updateTutor,
  deleteTutor,
  setTutorApproval,
};
