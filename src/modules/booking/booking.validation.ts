import { z } from 'zod';
import { BookingStatus } from '../../../generated/prisma/enums'; 

const createBookingZod = z.object({
  body: z.object({
    tutorId: z.string().uuid(), 
    categoryId: z.string().uuid(), 
    scheduledAt: z.string().datetime(), 
  }),
});

const updateBookingStatusZod = z.object({
  body: z.object({
    status: z.nativeEnum(BookingStatus), 
  }),
});

export const BookingValidation = { 
  createBookingZod, 
  updateBookingStatusZod 
};