import { highlightParts, matchesSearch, Searchable } from './search.utils';

describe('search.utils', () => {
  describe('matchesSearch', () => {
    const createItem = (overrides: Partial<Searchable> = {}): Searchable => ({
      name: 'Test Feature',
      key: 'test-feature',
      description: 'A test feature flag',
      type: 'boolean',
      tags: ['beta', 'experiment'],
      ...overrides,
    });

    it('should return true when query is empty', () => {
      const item = createItem();
      expect(matchesSearch(item, '')).toBe(true);
    });

    it('should match by name', () => {
      const item = createItem({ name: 'Dark Mode' });
      expect(matchesSearch(item, 'dark')).toBe(true);
      expect(matchesSearch(item, 'DARK')).toBe(true);
    });

    it('should match by key', () => {
      const item = createItem({ key: 'dark-mode-toggle' });
      expect(matchesSearch(item, 'toggle')).toBe(true);
    });

    it('should match by description', () => {
      const item = createItem({ description: 'Enables dark theme' });
      expect(matchesSearch(item, 'theme')).toBe(true);
    });

    it('should match by type', () => {
      const item = createItem({ type: 'boolean' });
      expect(matchesSearch(item, 'boolean')).toBe(true);
    });

    it('should match by tags', () => {
      const item = createItem({ tags: ['premium', 'feature'] });
      expect(matchesSearch(item, 'premium')).toBe(true);
    });

    it('should return false when no match', () => {
      const item = createItem();
      expect(matchesSearch(item, 'xyz-no-match')).toBe(false);
    });

    it('should handle items without type', () => {
      const item = createItem({ type: undefined });
      expect(matchesSearch(item, 'test')).toBe(true);
    });

    it('should handle empty tags', () => {
      const item = createItem({ tags: [] });
      expect(matchesSearch(item, 'test')).toBe(true);
    });
  });

  describe('highlightParts', () => {
    it('should return empty array for empty text', () => {
      expect(highlightParts('', 'query')).toEqual([]);
    });

    it('should return single non-match part when query is empty', () => {
      expect(highlightParts('hello world', '')).toEqual([{ text: 'hello world', match: false }]);
    });

    it('should highlight matching parts', () => {
      expect(highlightParts('hello world', 'world')).toEqual([
        { text: 'hello ', match: false },
        { text: 'world', match: true },
      ]);
    });

    it('should highlight at the start', () => {
      expect(highlightParts('hello world', 'hello')).toEqual([
        { text: 'hello', match: true },
        { text: ' world', match: false },
      ]);
    });

    it('should highlight multiple occurrences', () => {
      expect(highlightParts('foo bar foo', 'foo')).toEqual([
        { text: 'foo', match: true },
        { text: ' bar ', match: false },
        { text: 'foo', match: true },
      ]);
    });

    it('should be case-insensitive', () => {
      expect(highlightParts('Hello World', 'hello')).toEqual([
        { text: 'Hello', match: true },
        { text: ' World', match: false },
      ]);
    });

    it('should handle entire text match', () => {
      expect(highlightParts('test', 'test')).toEqual([{ text: 'test', match: true }]);
    });

    it('should handle no match', () => {
      expect(highlightParts('hello world', 'xyz')).toEqual([{ text: 'hello world', match: false }]);
    });

    it('should preserve original case in output', () => {
      expect(highlightParts('HeLLo WoRLd', 'hello')).toEqual([
        { text: 'HeLLo', match: true },
        { text: ' WoRLd', match: false },
      ]);
    });
  });
});
