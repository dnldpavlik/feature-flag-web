export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  key: string;
  name: string;
  description: string;
  isDefault?: boolean;
}
