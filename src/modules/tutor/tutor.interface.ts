// This prevents the 'string | undefined' error in the controller.
export interface ITutorParams {
  id?: string;
}
// Defines the shape of the data needed to register a tutor.
export interface ITutorRegistration {
  categoryIds: string[];
  bio?: string;
  hourlyRate: number;
}