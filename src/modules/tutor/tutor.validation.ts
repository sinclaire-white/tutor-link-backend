import { z } from "zod";

const createTutorZod = z.object({
  body: z.object({
    categoryIds: z
      .array(z.string(), { message: "Category IDs are required" })
      .min(1, "At least one category must be selected"),

    bio: z.string().optional(),

    image: z
      .string()
      .regex(
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i,
        "Invalid image URL format",
      )
      .optional(),

    hourlyRate: z
      .number({ message: "Hourly rate must be a number" })
      .positive("Rate must be a positive number"),
  }),
});

const updateTutorZod = z.object({
  body: z.object({
    addCategoryIds: z
      .array(z.string({ message: "Category IDs are required" }))
      .optional(),
    removeCategoryIds: z
      .array(z.string({ message: "Category IDs are required" }))
      .optional(),
    bio: z.string().optional(),
    image: z
      .string()
      .regex(
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i,
        "Invalid image URL format",
      )
      .optional(),
    hourlyRate: z
      .number({ message: "Hourly rate must be a number" })
      .positive("Rate must be a positive number")
      .optional(),
  }),
});

export const TutorValidation = { createTutorZod, updateTutorZod };
