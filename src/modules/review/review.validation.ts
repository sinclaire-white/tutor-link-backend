import { z } from 'zod';

const createReviewZod = z.object({
  body: z.object({
    
    bookingId: z.uuid({ 
      message: "Booking ID must be a valid" 
    }), 
    rating: z
      .number()
      .int("Rating must be a whole number")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),  
    comment: z
      .string()
      .max(500, "Comment cannot exceed 500 characters")
      .optional(), 
  }),
});

export const ReviewValidation = { createReviewZod };