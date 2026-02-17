/**
 * Filter Utilities
 *
 * Pure functions for creating and composing filter predicates.
 */

/**
 * Creates a text search predicate that checks if any of the specified fields
 * contain the query string (case-insensitive).
 *
 * @param fields - Array of field names to search
 * @param query - Search query (case-insensitive)
 * @returns Predicate function
 *
 * @example
 * ```typescript
 * const matchesQuery = textFilter(['name', 'key'], 'test');
 * items.filter(matchesQuery);
 * ```
 */
export function textFilter<T extends object>(
  fields: (keyof T & string)[],
  query: string,
): (item: T) => boolean {
  if (!query) {
    return () => true;
  }

  const lowerQuery = query.toLowerCase();
  return (item: T) => {
    const searchText = fields.map((field) => String(item[field] ?? '')).join(' ');
    return searchText.toLowerCase().includes(lowerQuery);
  };
}

/**
 * Creates a predicate that checks if a property equals a specific value.
 * Returns true for all items when value is 'all' (common "show all" pattern).
 *
 * @param field - Property name to check
 * @param value - Expected value (or 'all' to match everything)
 * @returns Predicate function
 *
 * @example
 * ```typescript
 * const isCreated = propertyEquals('action', 'created');
 * entries.filter(isCreated);
 *
 * const showAll = propertyEquals('status', 'all');
 * items.filter(showAll); // returns all items
 * ```
 */
export function propertyEquals<T extends object>(
  field: keyof T & string,
  value: string,
): (item: T) => boolean {
  if (value === 'all') {
    return () => true;
  }
  return (item: T) => item[field] === value;
}

/**
 * Combines multiple predicates with AND logic.
 * All predicates must return true for the item to pass.
 *
 * @param predicates - Array of predicate functions
 * @returns Combined predicate function
 *
 * @example
 * ```typescript
 * const filter = matchesAll([
 *   textFilter(['name'], query),
 *   propertyEquals('status', 'active'),
 * ]);
 * items.filter(filter);
 * ```
 */
export function matchesAll<T>(predicates: ((item: T) => boolean)[]): (item: T) => boolean {
  return (item: T) => predicates.every((predicate) => predicate(item));
}

/**
 * Combines multiple predicates with OR logic.
 * At least one predicate must return true for the item to pass.
 *
 * @param predicates - Array of predicate functions
 * @returns Combined predicate function
 *
 * @example
 * ```typescript
 * const filter = matchesAny([
 *   propertyEquals('type', 'boolean'),
 *   propertyEquals('type', 'string'),
 * ]);
 * items.filter(filter);
 * ```
 */
export function matchesAny<T>(predicates: ((item: T) => boolean)[]): (item: T) => boolean {
  if (predicates.length === 0) {
    return () => true;
  }
  return (item: T) => predicates.some((predicate) => predicate(item));
}

/**
 * Creates a predicate that checks if a property is truthy.
 *
 * @param field - Property name to check
 * @returns Predicate function
 */
export function isTruthy<T extends object>(field: keyof T & string): (item: T) => boolean {
  return (item: T) => Boolean(item[field]);
}

/**
 * Creates a predicate that checks if a property is falsy.
 *
 * @param field - Property name to check
 * @returns Predicate function
 */
export function isFalsy<T extends object>(field: keyof T & string): (item: T) => boolean {
  return (item: T) => !item[field];
}

/**
 * Negates a predicate.
 *
 * @param predicate - Predicate to negate
 * @returns Negated predicate function
 */
export function not<T>(predicate: (item: T) => boolean): (item: T) => boolean {
  return (item: T) => !predicate(item);
}
