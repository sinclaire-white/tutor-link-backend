export interface ICreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface IReviewParams {
  tutorId?: string;
}