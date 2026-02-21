import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { IUpdateUserProfilePayload } from "./user.interface";
import { paginate, PaginatedResult } from "../../utils/pagination";

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tutor: {
        include: {
          categories: true,
          availabilities: {
            orderBy: { dayOfWeek: "asc" },
          },
        },
      },
      studentBookings: {
        orderBy: { createdAt: "desc" },
        include: {
          tutor: {
            select: {
              name: true,
              image: true,
            },
          },
          category: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND");
  }

  return user;
};

const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phoneNumber: true,
      age: true,
      role: true,
      isSuspended: true,
      tutor: {
        select: {
          bio: true,
          qualifications: true,
          hourlyRate: true,
          isApproved: true,
          categories: { select: { name: true } },
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

const updateMyProfile = async (
  userId: string,
  payload: IUpdateUserProfilePayload,
) => {
  const updateData: Partial<IUpdateUserProfilePayload> = {};
  // Use !== undefined so explicit null passes through and clears the field in DB
  // (name is required in DB so it uses truthy check, never null)
  if (payload.name) updateData.name = payload.name;
  if (payload.age !== undefined) updateData.age = payload.age;
  if (payload.image !== undefined) updateData.image = payload.image;
  if (payload.phoneNumber !== undefined) updateData.phoneNumber = payload.phoneNumber;

  return await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};

const listUsers = async (opts?: { 
  search?: string; 
  page?: number; 
  perPage?: number;
  includeSuspended?: boolean;
}): Promise<PaginatedResult<any>> => {
  const where: any = {};
  
  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" as const } },
      { email: { contains: opts.search, mode: "insensitive" as const } },
    ];
  }

  // Exclude suspended users by default; pass includeSuspended=true to see all
  if (!opts?.includeSuspended) {
    where.isSuspended = false;
  }

  return paginate(prisma.user, where, {
    page: opts?.page,
    perPage: opts?.perPage,
    orderBy: { createdAt: "desc" },
  });
};

// Admin: Suspend user (soft delete)
const suspendUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.isSuspended) {
    throw new AppError(400, "User is already suspended");
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { isSuspended: true },
  });
};

// Admin: Reactivate suspended user
const unsuspendUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (!user.isSuspended) {
    throw new AppError(400, "User is not suspended");
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { isSuspended: false },
  });
};

const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  await prisma.$transaction(async (tx) => {
    const bookings = await tx.booking.findMany({
      where: { OR: [{ studentId: userId }, { tutorId: userId }] },
      select: { id: true },
    });
    const bookingIds = bookings.map((b) => b.id);

    if (bookingIds.length > 0) {
      await tx.review.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
    }

    await tx.tutor.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  listUsers,
  getUserById,
  suspendUser,
  unsuspendUser,
  deleteUser,
};