// Payload for PATCH /users/me — all fields are optional; send null to clear a nullable field
export interface IUpdateUserProfilePayload {
  name?: string;
  age?: number | null;
  image?: string | null;
  phoneNumber?: string | null;
}

