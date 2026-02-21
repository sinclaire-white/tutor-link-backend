import { BookingStatus, Day } from "../../../generated/prisma/enums";
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
      categories: true,
    },
  });

  if (!result) {
    throw new AppError(404, "Tutor profile not found");
  }
  return result;
};

// Registers a user as a tutor by creating a Tutor profile and updating their role
const registerTutor = async (userId: string, payload: ITutorRegistration) => {
  const { categoryIds, availabilities, ...tutorData } = payload;

  return await prisma.$transaction(async (tx) => {
    const existingTutor = await tx.tutor.findUnique({ where: { userId } });
    if (existingTutor)
      throw new AppError(400, "User is already registered as a tutor");

    // Update User Role to TUTOR
    await tx.user.update({
      where: { id: userId },
      data: { role: UserRole.TUTOR },
    });

    // Create the Tutor Profile
    const tutor = await tx.tutor.create({
      data: {
        userId,
        ...tutorData,
        categories: {
          connect: categoryIds.map((id: string) => ({ id })),
        },
      },
      include: { categories: true },
    });

    // Create availability slots if provided
    if (availabilities && availabilities.length > 0) {
      await tx.availability.createMany({
        data: availabilities.map(slot => ({
          tutorId: tutor.id,
          dayOfWeek: slot.dayOfWeek as Day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      });
    }

    return tutor;
  });
};

const getAllTutors = async (opts?: { 
  page?: number; 
  perPage?: number; 
  approved?: string | boolean;
  featured?: string | boolean;
  search?: string;
  category?: string;
}) => {
  const page = opts?.page && opts.page > 0 ? opts.page : 1;
  const perPage = opts?.perPage && opts.perPage > 0 ? opts.perPage : 10;
  
  const where: any = {};

  if (opts?.approved !== undefined) {
    if (typeof opts.approved === 'boolean') {
      where.isApproved = opts.approved;
    } else {
      where.isApproved = opts.approved === 'true';
    }
  }

  if (opts?.featured !== undefined) {
      if (typeof opts.featured === 'boolean') {
        where.isFeatured = opts.featured;
      } else {
        where.isFeatured = opts.featured === 'true';
      }
  }

  if (opts?.search) {
      where.OR = [
          { user: { name: { contains: opts.search, mode: 'insensitive' } } },
          { bio: { contains: opts.search, mode: 'insensitive' } }
      ];
  }

  if (opts?.category) {
      where.categories = {
          some: {
              id: opts.category
          }
      };
  }

  const items = await prisma.tutor.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      categories: true,
    },
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { createdAt: 'desc' },
  });
  
  const total = await prisma.tutor.count({ where });

  return { items, total, page, perPage };
};

// Returns a public-facing tutor profile including reviews and availability
const getPublicTutorProfile = async (id: string) => {
  const tutor = await prisma.tutor.findUnique({
    where: { id, isApproved: true },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
          phoneNumber: true,
          age: true,
        },
      },
      categories: true,
      availabilities: true,
      
    },
  });

  if (!tutor) {
    throw new AppError(404, "Tutor not found");
  }

  // Get reviews with student info
  const reviews = await prisma.review.findMany({
    where: {
      booking: {
        tutorId: tutor.userId,
      },
    },
    include: {
      booking: {
        select: {
          student: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return { ...tutor, reviews, reviewCount: reviews.length };
};

const updateTutor = async (id: string, payload: ITutorUpdatePayload) => {
  await findTutorOrThrow(id); // Ensure tutor exists

  const { addCategoryIds, removeCategoryIds, ...updateData } = payload;

  return await prisma.tutor.update({
    where: { id },
    data: {
      ...updateData,
      categories: {
        // connect adds new categories; disconnect removes without touching others
        ...(addCategoryIds && {
          connect: addCategoryIds.map((cid) => ({ id: cid })),
        }),
        ...(removeCategoryIds && {
          disconnect: removeCategoryIds.map((cid) => ({ id: cid })),
        }),
      },
    },
  });
};

// Deletes the tutor profile and reverts user role to STUDENT.
// Blocked if there are active (pending/confirmed/ongoing) bookings.
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

    await tx.user.update({
      where: { id: tutor.userId },
      data: { role: UserRole.STUDENT },
    });

    return await tx.tutor.delete({ where: { id } });
  });
};

const setTutorApproval = async (id: string, approved: boolean) => {
  const tutor = await findTutorOrThrow(id);
  
  return await prisma.$transaction(async (tx) => {
    // Rejecting: remove the profile so it no longer appears in pending list
    if (!approved) {
      await tx.user.update({
        where: { id: tutor.userId },
        data: { role: UserRole.STUDENT },
      });
      return await tx.tutor.delete({ where: { id } });
    } else {
      // Approving: ensure TUTOR role is set (may have been reverted by a prior rejection)
      await tx.user.update({
        where: { id: tutor.userId },
        data: { role: UserRole.TUTOR },
      });
      return await tx.tutor.update({ where: { id }, data: { isApproved: true } });
    }
  });
};

const setTutorFeatured = async (id: string, featured: boolean) => {
  await findTutorOrThrow(id);
  
  return await prisma.tutor.update({ 
    where: { id }, 
    data: { isFeatured: featured },
    include: {
      user: { select: { name: true, email: true, image: true } },
      categories: true,
    }
  });
};

export const TutorService = {
  registerTutor,
  getAllTutors,
  getSingleTutor: findTutorOrThrow,
  getPublicTutorProfile,
  updateTutor,
  deleteTutor,
  setTutorApproval,
  setTutorFeatured,
};
