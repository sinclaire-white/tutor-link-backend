import { z } from "zod";
import { BookingStatus } from "../../../generated/prisma/enums";

const createBookingZod = z.object({
  body: z.object({
    // User IDs are not guaranteed to be UUIDs depending on the auth provider
    tutorId: z.string(),
    categoryId: z.string(),
    scheduledAt: z.string().datetime(),
    duration: z.number().positive().min(0.5).max(12).optional().default(1),
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
