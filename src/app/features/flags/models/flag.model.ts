import { EnvironmentFlagValue, FlagTypeMap } from './flag-value.model';

export type FlagType = 'boolean' | 'string' | 'number' | 'json';

export interface Flag {
  id: string;
  projectId: string;
  key: string;
  name: string;
  description: string;
  type: FlagType;
  defaultValue: FlagTypeMap[FlagType];
  tags: string[];
  environmentValues: Record<string, EnvironmentFlagValue>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Type-safe flag interface using generics
 */
export interface TypedFlag<T extends FlagType> extends Omit<Flag, 'type' | 'defaultValue'> {
  type: T;
  defaultValue: FlagTypeMap[T];
}

/**
 * Discriminated union for type-safe flag creation
 */
export type CreateFlagInput =
  | CreateFlagInputBase<'boolean'>
  | CreateFlagInputBase<'string'>
  | CreateFlagInputBase<'number'>
  | CreateFlagInputBase<'json'>;

interface CreateFlagInputBase<T extends FlagType> {
  projectId: string;
  key: string;
  name: string;
  description: string;
  type: T;
  defaultValue: FlagTypeMap[T];
  tags: string[];
}

/**
 * Input for updating a flag's value in a specific environment
 */
export interface UpdateEnvironmentValueInput {
  flagId: string;
  environmentId: string;
  value?: FlagTypeMap[FlagType];
  enabled?: boolean;
}
