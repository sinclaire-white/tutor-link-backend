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
  return await prisma.$transaction(async (tx) => {
    // Remove existing slots to avoid duplicates
    await tx.availability.deleteMany({ where: { tutorId } });

    // Bulk insert new slots
    return await tx.availability.createMany({
      data: slots.map((slot) => ({ ...slot, tutorId })),
    });
  });
};

const getTutorAvailability = async (tutorId: string) => {
  return await prisma.availability.findMany({
    where: { tutorId },
    orderBy: { dayOfWeek: "asc" },
  });
};

export const AvailabilityService = {
  updateAvailability,
  getTutorAvailability,
};
