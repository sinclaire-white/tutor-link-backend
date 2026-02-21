import { prisma } from "../../lib/prisma";
import { Day } from "../../../generated/prisma/enums";

const updateAvailability = async (
  tutorId: string,
  slots: {
    dayOfWeek: Day;
    startTime: string;
    endTime: string;
  }[],
) => {
  // If the slots array is missing or empty, we shouldn't proceed.
  if (!slots || slots.length === 0) {
    throw new Error("PLEASE_PROVIDE_AT_LEAST_ONE_SLOT");
  }

  return await prisma.$transaction(async (tx) => {
    // We remove existing slots so we can replace them with the new ones (Syncing).
    await tx.availability.deleteMany({ where: { tutorId } });

    return await tx.availability.createMany({
      data: slots.map((slot) => ({ 
        ...slot, 
        tutorId 
      })),
    });
  });
};

const getTutorAvailability = async (tutorId: string) => {
  if (!tutorId) {
    throw new Error("TUTOR_ID_MISSING");
  }

  return await prisma.availability.findMany({
    where: { tutorId },
    orderBy: { dayOfWeek: "asc" }, // Keeps the days in order (Monday, Tuesday...)
  });
};

export const AvailabilityService = {
  updateAvailability,
  getTutorAvailability,
};