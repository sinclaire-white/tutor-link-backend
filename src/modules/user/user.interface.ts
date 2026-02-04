export interface IUpdateUserProfilePayload {
  name?: string;         // User's display name
  age?: number;          // Optional age in years
  image?: string;        // Profile image URL
  phoneNumber?: string;  // Contact number (no format validation)
}

