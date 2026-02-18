import { HighlightPart, Searchable } from './search.types';

export type { Searchable, HighlightPart };

/**
 * Checks if an item matches a search query.
 * Searches through name, key, description, type (if present), and tags.
 *
 * @param item - The item to search
 * @param query - The search query (case-insensitive)
 * @returns true if the item matches the query
 */
export const matchesSearch = (item: Searchable, query: string): boolean => {
  if (!query) {
    return true;
  }

  const searchableFields = [item.name, item.key, item.description, item.type ?? '', ...item.tags];

  const haystack = searchableFields.join(' ').toLowerCase();
  return haystack.includes(query.toLowerCase());
};

/**
 * Splits text into parts with highlight information for search highlighting.
 * Returns an array of parts where matched portions have `match: true`.
 *
 * @param text - The text to split
 * @param query - The search query to highlight (case-insensitive)
 * @returns Array of text parts with match information
 */
export const highlightParts = (text: string, query: string): HighlightPart[] => {
  if (!text) {
    return [];
  }

  if (!query) {
    return [{ text, match: false }];
  }

  const parts: HighlightPart[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let start = 0;
  let index = lowerText.indexOf(lowerQuery, start);

  while (index !== -1) {
    if (index > start) {
      parts.push({ text: text.slice(start, index), match: false });
    }
    parts.push({ text: text.slice(index, index + query.length), match: true });
    start = index + query.length;
    index = lowerText.indexOf(lowerQuery, start);
  }

  if (start < text.length) {
    parts.push({ text: text.slice(start), match: false });
  }

  return parts;
};
