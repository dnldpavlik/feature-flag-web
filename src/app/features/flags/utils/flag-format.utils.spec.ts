import {
  formatDisplayValue,
  formatFlagValue,
  parseValueForType,
  validateJsonObject,
} from './flag-format.utils';

describe('flag-format.utils', () => {
  describe('validateJsonObject', () => {
    describe('valid JSON objects', () => {
      it('should validate empty object', () => {
        const result = validateJsonObject('{}');
        expect(result.valid).toBe(true);
        expect(result.value).toEqual({});
      });

      it('should validate object with string value', () => {
        const result = validateJsonObject('{"key": "value"}');
        expect(result.valid).toBe(true);
        expect(result.value).toEqual({ key: 'value' });
      });

      it('should validate object with number value', () => {
        const result = validateJsonObject('{"count": 42}');
        expect(result.valid).toBe(true);
        expect(result.value).toEqual({ count: 42 });
      });

      it('should validate object with boolean value', () => {
        const result = validateJsonObject('{"enabled": true}');
        expect(result.valid).toBe(true);
        expect(result.value).toEqual({ enabled: true });
      });

      it('should validate object with nested object', () => {
        const result = validateJsonObject('{"nested": {"key": "value"}}');
        expect(result.valid).toBe(true);
        expect(result.value).toEqual({ nested: { key: 'value' } });
      });

      it('should validate object with array value', () => {
        const result = validateJsonObject('{"items": [1, 2, 3]}');
        expect(result.valid).toBe(true);
        expect(result.value).toEqual({ items: [1, 2, 3] });
      });

      it('should validate complex object', () => {
        const json = '{"name": "test", "count": 5, "enabled": true, "tags": ["a", "b"]}';
        const result = validateJsonObject(json);
        expect(result.valid).toBe(true);
        expect(result.value).toEqual({
          name: 'test',
          count: 5,
          enabled: true,
          tags: ['a', 'b'],
        });
      });
    });

    describe('invalid JSON', () => {
      it('should reject invalid JSON syntax', () => {
        const result = validateJsonObject('{invalid}');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid JSON syntax');
      });

      it('should reject unclosed braces', () => {
        const result = validateJsonObject('{"key": "value"');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid JSON syntax');
      });

      it('should reject arrays at root level', () => {
        const result = validateJsonObject('[1, 2, 3]');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('JSON must be an object');
      });

      it('should reject null at root level', () => {
        const result = validateJsonObject('null');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('JSON must be an object');
      });

      it('should reject string at root level', () => {
        const result = validateJsonObject('"string"');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('JSON must be an object');
      });

      it('should reject number at root level', () => {
        const result = validateJsonObject('42');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('JSON must be an object');
      });

      it('should reject boolean at root level', () => {
        const result = validateJsonObject('true');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('JSON must be an object');
      });

      it('should reject empty string', () => {
        const result = validateJsonObject('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid JSON syntax');
      });
    });
  });

  describe('parseValueForType', () => {
    describe('boolean type', () => {
      it('should parse "true" to true', () => {
        expect(parseValueForType('boolean', 'true')).toBe(true);
      });

      it('should parse "false" to false', () => {
        expect(parseValueForType('boolean', 'false')).toBe(false);
      });

      it('should parse any other value to false', () => {
        expect(parseValueForType('boolean', 'yes')).toBe(false);
        expect(parseValueForType('boolean', '1')).toBe(false);
        expect(parseValueForType('boolean', '')).toBe(false);
      });
    });

    describe('string type', () => {
      it('should return the string as-is', () => {
        expect(parseValueForType('string', 'hello')).toBe('hello');
      });

      it('should handle empty string', () => {
        expect(parseValueForType('string', '')).toBe('');
      });

      it('should preserve whitespace', () => {
        expect(parseValueForType('string', '  spaced  ')).toBe('  spaced  ');
      });
    });

    describe('number type', () => {
      it('should parse integer string', () => {
        expect(parseValueForType('number', '42')).toBe(42);
      });

      it('should parse float string', () => {
        expect(parseValueForType('number', '3.14')).toBe(3.14);
      });

      it('should parse negative number', () => {
        expect(parseValueForType('number', '-10')).toBe(-10);
      });

      it('should parse zero', () => {
        expect(parseValueForType('number', '0')).toBe(0);
      });

      it('should return null for invalid number', () => {
        expect(parseValueForType('number', 'not-a-number')).toBeNull();
      });

      it('should return 0 for empty string (JavaScript Number behavior)', () => {
        expect(parseValueForType('number', '')).toBe(0);
      });
    });

    describe('json type', () => {
      it('should parse valid JSON object', () => {
        const result = parseValueForType('json', '{"key": "value"}');
        expect(result).toEqual({ key: 'value' });
      });

      it('should parse valid JSON array', () => {
        const result = parseValueForType('json', '[1, 2, 3]');
        expect(result).toEqual([1, 2, 3]);
      });

      it('should parse JSON string', () => {
        const result = parseValueForType('json', '"hello"');
        expect(result).toBe('hello');
      });

      it('should return null for invalid JSON', () => {
        expect(parseValueForType('json', '{invalid}')).toBeNull();
      });

      it('should return null for empty string', () => {
        expect(parseValueForType('json', '')).toBeNull();
      });
    });
  });

  describe('formatFlagValue', () => {
    describe('boolean type', () => {
      it('should format true as "true"', () => {
        expect(formatFlagValue('boolean', true)).toBe('true');
      });

      it('should format false as "false"', () => {
        expect(formatFlagValue('boolean', false)).toBe('false');
      });

      it('should format truthy value as "true"', () => {
        expect(formatFlagValue('boolean', 1)).toBe('true');
      });

      it('should format falsy value as "false"', () => {
        expect(formatFlagValue('boolean', 0)).toBe('false');
      });
    });

    describe('string type', () => {
      it('should return string as-is', () => {
        expect(formatFlagValue('string', 'hello')).toBe('hello');
      });

      it('should convert number to string', () => {
        expect(formatFlagValue('string', 42)).toBe('42');
      });
    });

    describe('number type', () => {
      it('should format integer', () => {
        expect(formatFlagValue('number', 42)).toBe('42');
      });

      it('should format float', () => {
        expect(formatFlagValue('number', 3.14)).toBe('3.14');
      });
    });

    describe('json type', () => {
      it('should format object as JSON string', () => {
        expect(formatFlagValue('json', { key: 'value' })).toBe('{"key":"value"}');
      });

      it('should format array as JSON string', () => {
        expect(formatFlagValue('json', [1, 2, 3])).toBe('[1,2,3]');
      });

      it('should format null as JSON string', () => {
        expect(formatFlagValue('json', null)).toBe('null');
      });
    });
  });

  describe('formatDisplayValue', () => {
    describe('boolean values', () => {
      it('should format true as "true"', () => {
        expect(formatDisplayValue(true)).toBe('true');
      });

      it('should format false as "false"', () => {
        expect(formatDisplayValue(false)).toBe('false');
      });
    });

    describe('object values', () => {
      it('should format object as JSON string', () => {
        expect(formatDisplayValue({ key: 'value' })).toBe('{"key":"value"}');
      });

      it('should format array as JSON string', () => {
        expect(formatDisplayValue([1, 2, 3])).toBe('[1,2,3]');
      });

      it('should format null as JSON string', () => {
        expect(formatDisplayValue(null)).toBe('null');
      });
    });

    describe('primitive values', () => {
      it('should format string as-is', () => {
        expect(formatDisplayValue('hello')).toBe('hello');
      });

      it('should format number as string', () => {
        expect(formatDisplayValue(42)).toBe('42');
      });

      it('should format undefined as string', () => {
        expect(formatDisplayValue(undefined)).toBe('undefined');
      });
    });
  });
});
