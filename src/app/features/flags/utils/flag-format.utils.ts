import { FlagType } from '@/app/features/flags/models/flag.model';
import { FlagTypeMap } from '@/app/features/flags/models/flag-value.model';

export interface JsonValidationResult {
  valid: boolean;
  value?: Record<string, unknown>;
  error?: string;
}

/**
 * Validates a JSON string ensuring it parses to a plain object (not array or null).
 */
export function validateJsonObject(jsonString: string): JsonValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { valid: false, error: 'JSON must be an object' };
    }
    return { valid: true, value: parsed };
  } catch {
    return { valid: false, error: 'Invalid JSON syntax' };
  }
}

/**
 * Parses a raw string value into the appropriate type for a flag.
 * Returns null if parsing fails (e.g., invalid number or JSON).
 */
export function parseValueForType(type: FlagType, rawValue: string): FlagTypeMap[FlagType] | null {
  switch (type) {
    case 'boolean':
      return rawValue === 'true';
    case 'string':
      return rawValue;
    case 'number': {
      const parsed = Number(rawValue);
      return Number.isNaN(parsed) ? null : parsed;
    }
    case 'json':
      try {
        return JSON.parse(rawValue) as FlagTypeMap[FlagType];
      } catch {
        return null;
      }
  }
}

/**
 * Formats a flag value for display based on its type.
 */
export function formatFlagValue(type: FlagType, value: unknown): string {
  if (type === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (type === 'json') {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Formats any value for display (type-agnostic version).
 */
export function formatDisplayValue(value: unknown): string {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
