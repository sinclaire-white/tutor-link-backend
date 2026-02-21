export interface IBookingParams {
  id?: string;
}

export interface ICreateBookingPayload {
  studentId: string;
  tutorId: string;
  categoryId: string;
  scheduledAt: Date;
  duration?: number;
}