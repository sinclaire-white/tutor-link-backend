import { z } from "zod";


const updateUserProfileZod = z.object({
  body: z.object({
    // Name: 1-100 characters if provided
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .max(256, "Name cannot exceed 256 characters")
      .optional(),

    // Age: Positive integer, reasonable range 1-120
    age: z
      .number()
      .int("Age must be a whole number")
      .min(1, "Age must be at least 1")
      .max(130, "Age cannot exceed 130")
      .optional(),

    // Image: Valid URL format if provided
    image: z
      .preprocess(
        (val) => (val === "" ? undefined : val),
        z.string().url("Invalid image URL format").optional()
      ),

    // Phone: Any string format, max 20 chars
    phoneNumber: z
      .string()
      .max(20, "Phone number cannot exceed 20 characters")
      .optional(),
  }),
});

export const UserValidation = { updateUserProfileZod };