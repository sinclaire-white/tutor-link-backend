export interface ITutorParams {
  id?: string;
}

export interface ITutorRegistration {
  categoryIds: string[];
  bio?: string;
  image?: string;
  hourlyRate: number;
  availabilities?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
}

// All fields optional; send null to clear a nullable field
export interface ITutorUpdatePayload {
  addCategoryIds?: string[];
  removeCategoryIds?: string[];
  bio?: string | null;
  qualifications?: string | null;
  image?: string | null;
  hourlyRate?: number;
  isApproved?: boolean;
}
