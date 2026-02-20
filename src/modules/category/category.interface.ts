
export interface ICategoryParams {
  id?: string;  // Category ID from URL /:id
}

// Data for creating a new category
export interface ICreateCategoryPayload {
  name: string;           // 3-255 characters
  description?: string;   // Optional, max 1000 chars
}

// Data for updating an existing category
export interface IUpdateCategoryPayload {
  name?: string;                  // Can rename category
  description?: string | null;    // Can update or clear description (null clears it)
}