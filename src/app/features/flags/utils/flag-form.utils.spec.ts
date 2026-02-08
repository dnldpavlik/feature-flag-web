import {
  extractDefaultValue,
  buildCreateFlagInput,
  parseTags,
  FlagValueFormData,
} from './flag-form.utils';

describe('flag-form.utils', () => {
  describe('extractDefaultValue', () => {
    const baseFormData: FlagValueFormData = {
      booleanValue: true,
      stringValue: 'test-string',
      numberValue: 42,
      jsonValue: '{"key": "value"}',
    };

    it('should extract boolean value', () => {
      const result = extractDefaultValue('boolean', baseFormData);
      expect(result).toEqual({ success: true, value: true });
    });

    it('should extract false boolean value', () => {
      const result = extractDefaultValue('boolean', { ...baseFormData, booleanValue: false });
      expect(result).toEqual({ success: true, value: false });
    });

    it('should extract string value', () => {
      const result = extractDefaultValue('string', baseFormData);
      expect(result).toEqual({ success: true, value: 'test-string' });
    });

    it('should extract empty string value', () => {
      const result = extractDefaultValue('string', { ...baseFormData, stringValue: '' });
      expect(result).toEqual({ success: true, value: '' });
    });

    it('should extract number value', () => {
      const result = extractDefaultValue('number', baseFormData);
      expect(result).toEqual({ success: true, value: 42 });
    });

    it('should extract zero number value', () => {
      const result = extractDefaultValue('number', { ...baseFormData, numberValue: 0 });
      expect(result).toEqual({ success: true, value: 0 });
    });

    it('should extract valid JSON value', () => {
      const result = extractDefaultValue('json', baseFormData);
      expect(result).toEqual({ success: true, value: { key: 'value' } });
    });

    it('should fail for invalid JSON syntax', () => {
      const result = extractDefaultValue('json', { ...baseFormData, jsonValue: 'not json' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid JSON syntax');
      }
    });

    it('should fail for JSON array', () => {
      const result = extractDefaultValue('json', { ...baseFormData, jsonValue: '[1, 2, 3]' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('JSON must be an object');
      }
    });
  });

  describe('buildCreateFlagInput', () => {
    const baseParams = {
      projectId: 'proj_123',
      key: 'my-flag',
      name: 'My Flag',
      resourceName: 'My Flag',
      description: 'Test description',
      tags: ['test', 'feature'],
    };

    it('should build boolean flag input', () => {
      const result = buildCreateFlagInput({
        ...baseParams,
        type: 'boolean',
        defaultValue: true,
      });

      expect(result).toEqual({
        ...baseParams,
        type: 'boolean',
        defaultValue: true,
      });
    });

    it('should build string flag input', () => {
      const result = buildCreateFlagInput({
        ...baseParams,
        type: 'string',
        defaultValue: 'hello',
      });

      expect(result).toEqual({
        ...baseParams,
        type: 'string',
        defaultValue: 'hello',
      });
    });

    it('should build number flag input', () => {
      const result = buildCreateFlagInput({
        ...baseParams,
        type: 'number',
        defaultValue: 99,
      });

      expect(result).toEqual({
        ...baseParams,
        type: 'number',
        defaultValue: 99,
      });
    });

    it('should build json flag input', () => {
      const result = buildCreateFlagInput({
        ...baseParams,
        type: 'json',
        defaultValue: { limit: 10 },
      });

      expect(result).toEqual({
        ...baseParams,
        type: 'json',
        defaultValue: { limit: 10 },
      });
    });
  });

  describe('parseTags', () => {
    it('should parse comma-separated tags', () => {
      expect(parseTags('checkout, web, mobile')).toEqual(['checkout', 'web', 'mobile']);
    });

    it('should trim whitespace from tags', () => {
      expect(parseTags('  one ,  two  ,three  ')).toEqual(['one', 'two', 'three']);
    });

    it('should filter empty tags', () => {
      expect(parseTags('one, , two, ,three')).toEqual(['one', 'two', 'three']);
    });

    it('should return empty array for empty string', () => {
      expect(parseTags('')).toEqual([]);
    });

    it('should return empty array for whitespace only', () => {
      expect(parseTags('  ,  ,  ')).toEqual([]);
    });

    it('should handle single tag', () => {
      expect(parseTags('single')).toEqual(['single']);
    });
  });
});
