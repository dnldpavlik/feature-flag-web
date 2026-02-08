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
 * Input for updating an existing environment
 */
export interface UpdateEnvironmentInput {
  name?: string;
  key?: string;
  color?: string;
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
