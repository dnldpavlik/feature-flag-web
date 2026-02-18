import { capitalize } from './string.utils';

describe('string.utils', () => {
  describe('capitalize', () => {
    it('should capitalize the first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should return empty string for empty input', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('should not change already capitalized string', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });
  });
});
