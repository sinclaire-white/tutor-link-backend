
// Prevents 'string | undefined' errors for ID params
export interface IBookingParams {
  id?: string;
}

// Defines the strict shape for creating a booking
export interface ICreateBookingPayload {
  studentId: string;
  tutorId: string;
  categoryId: string;
  scheduledAt: Date;
  duration?: number;
}