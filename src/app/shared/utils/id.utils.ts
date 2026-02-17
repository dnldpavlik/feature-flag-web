/**
 * Generates a random ID with the given prefix.
 * Format: `{prefix}_{8-char-random-string}`
 *
 * @param prefix - The prefix for the ID (e.g., 'flag', 'env', 'proj', 'seg')
 */
export const createId = (prefix: string): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
