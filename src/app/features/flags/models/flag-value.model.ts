import { FlagType } from './flag.model';

/**
 * Maps FlagType to actual TypeScript types for type-safe values
 */
export interface FlagTypeMap {
  boolean: boolean;
  string: string;
  number: number;
  json: Record<string, unknown>;
}

/**
 * Generic helper to extract value type from FlagType
 */
export type FlagValueType<T extends FlagType> = FlagTypeMap[T];

/**
 * Environment-specific flag value with enabled state and typed value
 */
export interface EnvironmentFlagValue<T extends FlagType = FlagType> {
  environmentId: string;
  flagId: string;
  enabled: boolean;
  value: FlagTypeMap[T];
  updatedAt: string;
}

/**
 * Type guard for boolean flag values
 */
export const isBooleanFlagValue = (
  type: FlagType,
  value: FlagTypeMap[FlagType]
): value is boolean => type === 'boolean' && typeof value === 'boolean';

/**
 * Type guard for string flag values
 */
export const isStringFlagValue = (
  type: FlagType,
  value: FlagTypeMap[FlagType]
): value is string => type === 'string' && typeof value === 'string';

/**
 * Type guard for number flag values
 */
export const isNumberFlagValue = (
  type: FlagType,
  value: FlagTypeMap[FlagType]
): value is number =>
  type === 'number' && typeof value === 'number' && !Number.isNaN(value);

/**
 * Type guard for json flag values
 */
export const isJsonFlagValue = (
  type: FlagType,
  value: FlagTypeMap[FlagType]
): value is Record<string, unknown> =>
  type === 'json' &&
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);
