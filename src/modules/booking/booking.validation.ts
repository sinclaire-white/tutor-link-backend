import { z } from "zod";
import { BookingStatus } from "../../../generated/prisma/enums";

const createBookingZod = z.object({
  body: z.object({
    tutorId: z.uuid(),
    categoryId: z.uuid(),
    scheduledAt: z.iso.datetime(),
  }),
});

const updateBookingStatusZod = z.object({
  body: z.object({
    status: z.enum(Object.values(BookingStatus) as [string, ...string[]]),
  }),
});

export const BookingValidation = {
  createBookingZod,
  updateBookingStatusZod,
};
