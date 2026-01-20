import {
  isBooleanFlagValue,
  isStringFlagValue,
  isNumberFlagValue,
  isJsonFlagValue,
} from './flag-value.model';

describe('flag-value.model type guards', () => {
  describe('isBooleanFlagValue', () => {
    it('should return true for boolean type with boolean value', () => {
      expect(isBooleanFlagValue('boolean', true)).toBe(true);
      expect(isBooleanFlagValue('boolean', false)).toBe(true);
    });

    it('should return false for non-boolean type', () => {
      expect(isBooleanFlagValue('string', true)).toBe(false);
      expect(isBooleanFlagValue('number', true)).toBe(false);
      expect(isBooleanFlagValue('json', true)).toBe(false);
    });

    it('should return false for boolean type with non-boolean value', () => {
      expect(isBooleanFlagValue('boolean', 'true' as unknown as boolean)).toBe(false);
    });
  });

  describe('isStringFlagValue', () => {
    it('should return true for string type with string value', () => {
      expect(isStringFlagValue('string', 'hello')).toBe(true);
      expect(isStringFlagValue('string', '')).toBe(true);
    });

    it('should return false for non-string type', () => {
      expect(isStringFlagValue('boolean', 'hello')).toBe(false);
      expect(isStringFlagValue('number', 'hello')).toBe(false);
      expect(isStringFlagValue('json', 'hello')).toBe(false);
    });

    it('should return false for string type with non-string value', () => {
      expect(isStringFlagValue('string', 123 as unknown as string)).toBe(false);
    });
  });

  describe('isNumberFlagValue', () => {
    it('should return true for number type with number value', () => {
      expect(isNumberFlagValue('number', 42)).toBe(true);
      expect(isNumberFlagValue('number', 0)).toBe(true);
      expect(isNumberFlagValue('number', -10)).toBe(true);
      expect(isNumberFlagValue('number', 3.14)).toBe(true);
    });

    it('should return false for non-number type', () => {
      expect(isNumberFlagValue('boolean', 42)).toBe(false);
      expect(isNumberFlagValue('string', 42)).toBe(false);
      expect(isNumberFlagValue('json', 42)).toBe(false);
    });

    it('should return false for number type with NaN', () => {
      expect(isNumberFlagValue('number', NaN)).toBe(false);
    });

    it('should return false for number type with non-number value', () => {
      expect(isNumberFlagValue('number', '42' as unknown as number)).toBe(false);
    });
  });

  describe('isJsonFlagValue', () => {
    it('should return true for json type with object value', () => {
      expect(isJsonFlagValue('json', { key: 'value' })).toBe(true);
      expect(isJsonFlagValue('json', {})).toBe(true);
    });

    it('should return false for non-json type', () => {
      expect(isJsonFlagValue('boolean', { key: 'value' })).toBe(false);
      expect(isJsonFlagValue('string', { key: 'value' })).toBe(false);
      expect(isJsonFlagValue('number', { key: 'value' })).toBe(false);
    });

    it('should return false for json type with null', () => {
      expect(isJsonFlagValue('json', null as unknown as Record<string, unknown>)).toBe(false);
    });

    it('should return false for json type with array', () => {
      expect(isJsonFlagValue('json', [1, 2, 3] as unknown as Record<string, unknown>)).toBe(false);
    });
  });
});
