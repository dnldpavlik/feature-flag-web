/**
 * Represents a deployment environment (e.g., development, staging, production)
 */
export interface Environment {
  id: string;
  key: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new environment
 */
export interface CreateEnvironmentInput {
  key: string;
  name: string;
  color: string;
  order: number;
  isDefault?: boolean;
}
