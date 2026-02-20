import { z } from "zod";
import { BookingStatus } from "../../../generated/prisma/enums";

const createBookingZod = z.object({
  body: z.object({
    tutorId: z.string(), // Changed from uuid to string as User ID might not be UUID
    categoryId: z.string(), // changed from uuid to string just in cae
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
