import { BookingStatus } from "../../../generated/prisma/enums";
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
    // check if userId is provided
    if (!userId) {
    throw new Error("USER_ID_IS_REQUIRED");
  }

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

// Fetches a specific tutor and includes their basic User info (name, email)
const getSingleTutor = async (id: string) => {
    
  if (!id) return null; // Guard for missing ID

//   Fetch tutor with associated user details
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
    },
  });
  return result;
};
// Update Tutor Profile (Used by Tutor or Admin)
const updateTutor = async (id: string, payload: any) => {
    if (!id) throw new Error("ID_IS_REQUIRED"); // ID should always be provided by caller

  return await prisma.tutor.update({
    where: { id },
    data: payload,
  });
};


// This only deletes the Tutor profile, not the User account.

const deleteTutor = async (id: string) => {
    if (!id) throw new Error("ID_IS_REQUIRED"); // ID should always be provided by caller
    
  return await prisma.$transaction(async (tx) => {
    // Find the tutor profile first to get the associated userId
    const tutor = await tx.tutor.findUnique({ 
      where: { id } 
    });

    if (!tutor) {
      throw new Error("TUTOR_NOT_FOUND");
    }

    // Check for active/upcoming bookings using the userId
    const activeBookings = await tx.booking.findFirst({
      where: {
        tutorId: tutor.userId, 
        status: {
          in: [
            BookingStatus.PENDING, 
            BookingStatus.CONFIRMED, 
            BookingStatus.ONGOING
          ]
        }
      }
    });

    if (activeBookings) {
      throw new Error("CANNOT_DELETE_WITH_ACTIVE_SESSIONS");
    }

    // Revert user role back to STUDENT
    await tx.user.update({
      where: { id: tutor.userId },
      data: { role: UserRole.STUDENT },
    });

    // Finally, delete the tutor record
    return await tx.tutor.delete({ 
      where: { id } 
    });
  });
};

export const TutorService = {
  registerTutor,
  getAllTutors,
  getSingleTutor,
  updateTutor,
  deleteTutor,
};
