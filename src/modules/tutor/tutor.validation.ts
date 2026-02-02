import { z } from "zod";

const createTutorZod = z.object({
  body: z.object({
    subject: z.string().min(3).max(100),
    bio: z.string().optional(),
    image: z.string().url().optional(),
    hourlyRate: z.number().positive(),
  }),
});

const updateTutorZod = z.object({
  body: z.object({
    subject: z.string().min(3).max(100).optional(),
    bio: z.string().optional(),
    image: z.string().url().optional(),
    hourlyRate: z.number().positive().optional(),
  }),
});

export const TutorValidation = { createTutorZod, updateTutorZod };
