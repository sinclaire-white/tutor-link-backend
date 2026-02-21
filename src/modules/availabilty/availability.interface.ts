import { Day } from "../../../generated/prisma/enums";

// A single availability slot for a tutor
export interface IAvailabilitySlot {
  dayOfWeek: Day;      // Enum: MONDAY, TUESDAY, etc.
  startTime: string;   // Format: "HH:mm" (24-hour)
  endTime: string;     // Must be after startTime
}

export interface IUpdateAvailabilityPayload {
  slots: IAvailabilitySlot[];
}

export interface IAvailabilityParams {
  tutorId?: string;
}