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
export const UserService = {
  getMyProfile,
  updateMyProfile,
};
