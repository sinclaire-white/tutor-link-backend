export interface ICreateReviewPayload {
  bookingId: string;  // UUID of completed booking
  rating: number;     // 1-5 star rating
  comment?: string;   // Optional textual feedback
}

export interface IReviewParams {
  tutorId?: string;  // For fetching tutor's reviews
}