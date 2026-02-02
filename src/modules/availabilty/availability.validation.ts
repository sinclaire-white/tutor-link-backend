import { z } from "zod";
import { Day } from "../../../generated/prisma/enums";

const createAvailabilityZodSchema = z.object({
  body: z.object({
    dayOfWeek: z.nativeEnum(Day),
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Use HH:mm format"),
    endTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Use HH:mm format"),
  }),
});

export const AvailabilityValidation = { createAvailabilityZodSchema };
