import { prisma } from "../../lib/prisma";

const getMyProfile = async (userId: string) => {
  if (!userId) throw new Error("ID_REQUIRED");

  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tutor: true, // Include tutor profile if they are a tutor
      studentBookings: { 
        take: 3, 
        orderBy: { createdAt: 'desc' } // Show recent activity
      } 
    }
  });
};

const updateMyProfile = async (userId: string, payload: any) => {
  if (!userId) throw new Error("ID_REQUIRED");

  return await prisma.user.update({
    where: { id: userId },
    data: payload,
  });
};

export const UserService = { getMyProfile, updateMyProfile };