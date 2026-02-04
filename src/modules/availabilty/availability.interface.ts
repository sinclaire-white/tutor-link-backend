import { Day } from "../../../generated/prisma/enums";

// Defines a single availability slot for a tutor
export interface IAvailabilitySlot {
  dayOfWeek: Day;      // Enum: MONDAY, TUESDAY, etc.
  startTime: string;   // Format: "HH:mm" (24-hour)
  endTime: string;     // Must be after startTime
}

// Payload for updating a tutor's availability
export interface IUpdateAvailabilityPayload {
  slots: IAvailabilitySlot[];
}

// Parameters for fetching availability data
export interface IAvailabilityParams {
  tutorId?: string;
}