import { FormGroup } from '@angular/forms';

/**
 * Check if required text fields in a form have non-empty values.
 *
 * @param form - The form group to check
 * @param fields - Array of field names that must have non-empty trimmed values
 * @returns true if all specified fields have non-empty trimmed values
 *
 * @example
 * ```typescript
 * protected canAdd(): boolean {
 *   return hasRequiredFields(this.form, ['name', 'key']);
 * }
 * ```
 */
export function hasRequiredFields(form: FormGroup, fields: string[]): boolean {
  return fields.every((field) => {
    const value = form.get(field)?.value;
    return typeof value === 'string' && value.trim().length > 0;
  });
}

/**
 * Get trimmed values from a form for the specified fields.
 *
 * @param form - The form group
 * @param fields - Array of field names to extract
 * @returns Object with field names as keys and trimmed string values
 *
 * @example
 * ```typescript
 * const { name, key, description } = getTrimmedValues(this.form, ['name', 'key', 'description']);
 * ```
 */
export function getTrimmedValues<T extends string>(
  form: FormGroup,
  fields: T[],
): Record<T, string> {
  const result = {} as Record<T, string>;
  for (const field of fields) {
    const value = form.get(field)?.value;
    result[field] = typeof value === 'string' ? value.trim() : String(value ?? '');
  }
  return result;
}

/**
 * Create a type-safe accessor object for form fields.
 * Provides get/set access to form controls with automatic value retrieval.
 *
 * @param form - The form group
 * @returns Proxy object that allows property access to form values
 *
 * @example
 * ```typescript
 * const fields = createFormFieldAccessors(this.form);
 * fields.name = 'Test'; // Sets form control value
 * console.log(fields.name); // Gets form control value
 * ```
 */
export function createFormFieldAccessors<T extends object>(form: FormGroup): T {
  return new Proxy({} as T, {
    get(_target, prop: string) {
      return form.get(prop)?.value ?? '';
    },
    set(_target, prop: string, value: unknown) {
      form.get(prop)?.setValue(value);
      return true;
    },
  });
}

/**
 * Extract the value string from a DOM input/select/textarea event.
 *
 * Replaces the repeated `(event.target as HTMLInputElement).value` cast pattern.
 */
export function getInputValue(event: Event): string {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}
