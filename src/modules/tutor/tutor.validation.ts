import { z } from "zod";

const createTutorZod = z.object({
  body: z.object({
    categoryIds: z
      .array(z.string(), { message: "Category IDs are required" })
      .min(1, "At least one category must be selected"),

    bio: z.string().optional(),
    
    qualifications: z.string().optional(),

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

   
    availabilities: z.array(
      z.object({
        dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      })
    ).optional(),
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
    qualifications: z.string().optional(),
    image: z
      .preprocess(
        (val) => (val === "" ? undefined : val),
        z.string()
          .regex(
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i,
            "Invalid image URL format",
          )
          .optional()
      ),
    hourlyRate: z
      .number({ message: "Hourly rate must be a number" })
      .positive("Rate must be a positive number")
      .optional(),
  }),
});

export const TutorValidation = { createTutorZod, updateTutorZod };
