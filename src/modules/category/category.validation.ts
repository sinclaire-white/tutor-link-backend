
import { z } from "zod";

const createCategoryZod = z.object({
  body: z.object({
    name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name cannot exceed 255 characters"), 
    
    description: z.string().optional(), 
  }),
});

const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().max(255).optional(),
    description: z.string().nullable().optional(),
  }),
});

export const CategoryValidation = {
  createCategoryZod,
  updateCategoryZodSchema,
};