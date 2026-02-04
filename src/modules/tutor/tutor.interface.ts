// This prevents the 'string | undefined' error in the controller.
export interface ITutorParams {
  id?: string;
}
// Defines the shape of the data needed to register a tutor.
export interface ITutorRegistration {
  categoryIds: string[];
  bio?: string;
  image?: string;
  hourlyRate: number;
}

export interface ITutorUpdatePayload {
  addCategoryIds?: string[];    // New categories to add
  removeCategoryIds?: string[]; // Existing categories to remove
  bio?: string;
  image?: string;
  hourlyRate?: number;
}