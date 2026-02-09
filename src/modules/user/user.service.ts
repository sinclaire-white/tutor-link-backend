import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { IUpdateUserProfilePayload } from "./user.interface";

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tutor: true,
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

const updateMyProfile = async (
  userId: string,
  payload: IUpdateUserProfilePayload,
) => {
  // Prevent sensitive field updates through this route
  const updateData: Partial<IUpdateUserProfilePayload> = {};
  if (payload.name) updateData.name = payload.name;
  if (payload.age) updateData.age = payload.age;
  if (payload.image) updateData.image = payload.image;
  if (payload.phoneNumber) updateData.phoneNumber = payload.phoneNumber;

  return await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};

type PagedResult<T> = { items: T[]; total: number; page: number; perPage: number };

const listUsers = async (opts?: { search?: string; page?: number; perPage?: number }): Promise<PagedResult<any>> => {
  const page = opts?.page && opts.page > 0 ? opts.page : 1;
  const perPage = opts?.perPage && opts.perPage > 0 ? opts.perPage : 10;
  const where = opts?.search
    ? { OR: [{ name: { contains: opts.search, mode: "insensitive" } }, { email: { contains: opts.search, mode: "insensitive" } }] }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, perPage };
};

const setUserSuspended = async (userId: string, suspended: boolean) => {
  return await prisma.user.update({ where: { id: userId }, data: { isSuspended: suspended } });
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  listUsers,
  setUserSuspended,
};
