export interface ICategoryParams {
  id?: string;
}

export interface ICreateCategoryPayload {
  name: string;
  description?: string;
}

// Send null for description to explicitly clear it
export interface IUpdateCategoryPayload {
  name?: string;
  description?: string | null;
}