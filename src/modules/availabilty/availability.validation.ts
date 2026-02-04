import { z } from "zod";

// Time regex for HH:mm format
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Validation schema for a single availability slot
const slotSchema = z.object({
  
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY", 
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY"
  ], {
    message: "Invalid day of week"
  }),
  
// Validate time format
  startTime: z.string().regex(timeRegex, "Start time must be in HH:mm format"),
  endTime: z.string().regex(timeRegex, "End time must be in HH:mm format"),
}).refine(
  (data) => data.startTime < data.endTime, // Ensure startTime is before endTime
  {
    message: "End time must be after start time",
    path: ["endTime"], // Error path
  }
);

// Validation schema for updating availability
const updateAvailabilityZod = z.object({
  body: z.object({
    slots: z.array(slotSchema)
      .min(1, "At least one availability slot is required")
      .max(7, "Cannot exceed 7 slots (one per day)"),
  }),
});

export const AvailabilityValidation = { updateAvailabilityZod };