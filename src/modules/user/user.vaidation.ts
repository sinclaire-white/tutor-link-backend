import { z } from "zod";

const updateUserProfileZod = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .max(256, "Name cannot exceed 256 characters")
      .optional(),

    age: z
      .number()
      .int("Age must be a whole number")
      .min(1, "Age must be at least 1")
      .max(130, "Age cannot exceed 130")
      .nullable()
      .optional(),

    // Empty string is coerced to null so the field is cleared rather than rejected
    image: z
      .preprocess(
        (val) => (val === "" ? null : val),
        z.string().url("Invalid image URL format").nullable().optional()
      ),

    phoneNumber: z
      .string()
      .max(20, "Phone number cannot exceed 20 characters")
      .nullable()
      .optional(),
  }),
});

export const UserValidation = { updateUserProfileZod };