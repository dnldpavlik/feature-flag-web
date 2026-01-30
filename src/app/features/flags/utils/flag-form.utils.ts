import { FlagType, CreateFlagInput } from '@/app/features/flags/models/flag.model';
import { FlagTypeMap } from '@/app/features/flags/models/flag-value.model';
import { validateJsonObject } from './flag-format.utils';

/**
 * Form values for flag value fields.
 */
export interface FlagValueFormData {
  booleanValue: boolean;
  stringValue: string;
  numberValue: number;
  jsonValue: string;
}

/**
 * Result of extracting a default value from form data.
 */
export type ExtractValueResult =
  | { success: true; value: FlagTypeMap[FlagType] }
  | { success: false; error: string };

/**
 * Extract the default value from form data based on flag type.
 *
 * @param type - The flag type
 * @param formData - Form data containing value fields
 * @returns Success with value, or failure with error message
 *
 * @example
 * ```typescript
 * const result = extractDefaultValue('boolean', formData);
 * if (result.success) {
 *   console.log(result.value); // true or false
 * }
 * ```
 */
export function extractDefaultValue(
  type: FlagType,
  formData: FlagValueFormData,
): ExtractValueResult {
  switch (type) {
    case 'boolean':
      return { success: true, value: formData.booleanValue };
    case 'string':
      return { success: true, value: formData.stringValue };
    case 'number':
      return { success: true, value: formData.numberValue };
    case 'json': {
      const result = validateJsonObject(formData.jsonValue);
      if (!result.valid) {
        return { success: false, error: result.error! };
      }
      return { success: true, value: result.value as FlagTypeMap[FlagType] };
    }
  }
}

/**
 * Build a type-safe CreateFlagInput from common fields.
 *
 * This helper eliminates the verbose switch statement needed to create
 * properly typed flag inputs.
 *
 * @param params - Common flag creation parameters
 * @returns A properly typed CreateFlagInput
 *
 * @example
 * ```typescript
 * const input = buildCreateFlagInput({
 *   projectId: 'proj_123',
 *   type: 'boolean',
 *   key: 'my-flag',
 *   name: 'My Flag',
 *   description: 'A test flag',
 *   tags: ['test'],
 *   defaultValue: true,
 * });
 * ```
 */
export function buildCreateFlagInput(params: {
  projectId: string;
  type: FlagType;
  key: string;
  name: string;
  description: string;
  tags: string[];
  defaultValue: FlagTypeMap[FlagType];
}): CreateFlagInput {
  const { projectId, type, key, name, description, tags, defaultValue } = params;
  const base = { projectId, key, name, description, tags };

  switch (type) {
    case 'boolean':
      return { ...base, type: 'boolean', defaultValue: defaultValue as boolean };
    case 'string':
      return { ...base, type: 'string', defaultValue: defaultValue as string };
    case 'number':
      return { ...base, type: 'number', defaultValue: defaultValue as number };
    case 'json':
      return { ...base, type: 'json', defaultValue: defaultValue as Record<string, unknown> };
  }
}

/**
 * Parse a comma-separated tags string into an array of trimmed, non-empty tags.
 *
 * @param tagsString - Comma-separated tags (e.g., "checkout, web, mobile")
 * @returns Array of trimmed tag strings
 *
 * @example
 * ```typescript
 * parseTags('checkout, web, mobile') // ['checkout', 'web', 'mobile']
 * parseTags('  one ,  , two  ')      // ['one', 'two']
 * ```
 */
export function parseTags(tagsString: string): string[] {
  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}
