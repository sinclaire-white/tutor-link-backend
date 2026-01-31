import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth.middleware";

// an interface to define exactly what data to expect for registration
interface ITutorRegistration {
  subject: string;
  bio?: string;
  hourlyRate: number;
}

// Registers a user as a tutor by creating a Tutor profile and updating their role
const registerTutor = async (userId: string, payload: ITutorRegistration) => {
  return await prisma.$transaction(async (tx) => {
    // Update User Role to TUTOR
    await tx.user.update({
      where: { id: userId },
      data: { role: UserRole.TUTOR },
    });

    // Create the specialized Tutor Profile
    const result = await tx.tutor.create({
      data: {
        userId,
        ...payload,
      },
    });

    return result;
  });
};

// Fetches all tutors along with their associated user details
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
    },
  });
};

export const TutorService = {
  registerTutor,
  getAllTutors,
};