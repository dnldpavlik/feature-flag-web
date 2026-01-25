import { Flag, FlagType } from '@/app/features/flags/models/flag.model';

import {
  createEnvironmentValue,
  getDefaultForType,
  getEffectiveValue,
  isEnabledInEnvironment,
  updateFlagEnvironmentValue,
  validateValueType,
} from './flag-value.utils';

describe('flag-value.utils', () => {
  describe('getDefaultForType', () => {
    it('should return false for boolean type', () => {
      expect(getDefaultForType('boolean')).toBe(false);
    });

    it('should return empty string for string type', () => {
      expect(getDefaultForType('string')).toBe('');
    });

    it('should return 0 for number type', () => {
      expect(getDefaultForType('number')).toBe(0);
    });

    it('should return empty object for json type', () => {
      expect(getDefaultForType('json')).toEqual({});
    });
  });

  describe('validateValueType', () => {
    describe('boolean validation', () => {
      it('should accept true', () => {
        expect(validateValueType('boolean', true)).toBe(true);
      });

      it('should accept false', () => {
        expect(validateValueType('boolean', false)).toBe(true);
      });

      it('should reject string "true"', () => {
        expect(validateValueType('boolean', 'true')).toBe(false);
      });

      it('should reject number 1', () => {
        expect(validateValueType('boolean', 1)).toBe(false);
      });
    });

    describe('string validation', () => {
      it('should accept non-empty string', () => {
        expect(validateValueType('string', 'hello')).toBe(true);
      });

      it('should accept empty string', () => {
        expect(validateValueType('string', '')).toBe(true);
      });

      it('should reject number', () => {
        expect(validateValueType('string', 123)).toBe(false);
      });

      it('should reject boolean', () => {
        expect(validateValueType('string', true)).toBe(false);
      });
    });

    describe('number validation', () => {
      it('should accept integer', () => {
        expect(validateValueType('number', 42)).toBe(true);
      });

      it('should accept float', () => {
        expect(validateValueType('number', 3.14)).toBe(true);
      });

      it('should accept zero', () => {
        expect(validateValueType('number', 0)).toBe(true);
      });

      it('should accept negative number', () => {
        expect(validateValueType('number', -10)).toBe(true);
      });

      it('should reject NaN', () => {
        expect(validateValueType('number', NaN)).toBe(false);
      });

      it('should reject string "42"', () => {
        expect(validateValueType('number', '42')).toBe(false);
      });
    });

    describe('json validation', () => {
      it('should accept object with properties', () => {
        expect(validateValueType('json', { key: 'value' })).toBe(true);
      });

      it('should accept empty object', () => {
        expect(validateValueType('json', {})).toBe(true);
      });

      it('should accept nested object', () => {
        expect(validateValueType('json', { nested: { deep: true } })).toBe(true);
      });

      it('should reject null', () => {
        expect(validateValueType('json', null)).toBe(false);
      });

      it('should reject array', () => {
        expect(validateValueType('json', [1, 2, 3])).toBe(false);
      });

      it('should reject string', () => {
        expect(validateValueType('json', '{"key": "value"}')).toBe(false);
      });
    });

    it('should return false for unknown type', () => {
      expect(validateValueType('unknown' as FlagType, 'value')).toBe(false);
    });
  });

  describe('getEffectiveValue', () => {
    const mockFlag: Flag = {
      id: 'flag_1',
      key: 'test-flag',
      name: 'Test Flag',
      description: 'Test description',
      type: 'string',
      defaultValue: 'default-value',
      tags: [],
      environmentValues: {
        env_dev: {
          environmentId: 'env_dev',
          flagId: 'flag_1',
          value: 'dev-value',
          enabled: true,
          updatedAt: '2024-01-01T00:00:00Z',
        },
        env_staging: {
          environmentId: 'env_staging',
          flagId: 'flag_1',
          value: 'staging-value',
          enabled: false,
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should return environment-specific value when it exists', () => {
      expect(getEffectiveValue(mockFlag, 'env_dev')).toBe('dev-value');
    });

    it('should return different value for different environment', () => {
      expect(getEffectiveValue(mockFlag, 'env_staging')).toBe('staging-value');
    });

    it('should fall back to default value when no environment value exists', () => {
      expect(getEffectiveValue(mockFlag, 'env_prod')).toBe('default-value');
    });

    it('should fall back to default for empty environment ID', () => {
      expect(getEffectiveValue(mockFlag, '')).toBe('default-value');
    });
  });

  describe('isEnabledInEnvironment', () => {
    const mockFlag: Flag = {
      id: 'flag_1',
      key: 'test-flag',
      name: 'Test Flag',
      description: 'Test',
      type: 'boolean',
      defaultValue: false,
      tags: [],
      environmentValues: {
        env_dev: {
          environmentId: 'env_dev',
          flagId: 'flag_1',
          value: true,
          enabled: true,
          updatedAt: '2024-01-01T00:00:00Z',
        },
        env_staging: {
          environmentId: 'env_staging',
          flagId: 'flag_1',
          value: true,
          enabled: false,
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should return true when flag is enabled in environment', () => {
      expect(isEnabledInEnvironment(mockFlag, 'env_dev')).toBe(true);
    });

    it('should return false when flag is disabled in environment', () => {
      expect(isEnabledInEnvironment(mockFlag, 'env_staging')).toBe(false);
    });

    it('should return false when environment value does not exist', () => {
      expect(isEnabledInEnvironment(mockFlag, 'env_prod')).toBe(false);
    });
  });

  describe('createEnvironmentValue', () => {
    it('should create environment value with provided boolean value', () => {
      const result = createEnvironmentValue('flag_1', 'env_dev', 'boolean', true);

      expect(result.flagId).toBe('flag_1');
      expect(result.environmentId).toBe('env_dev');
      expect(result.value).toBe(true);
      expect(result.enabled).toBe(false);
      expect(result.updatedAt).toBeDefined();
    });

    it('should create environment value with provided string value', () => {
      const result = createEnvironmentValue('flag_1', 'env_dev', 'string', 'hello');

      expect(result.value).toBe('hello');
    });

    it('should create environment value with provided number value', () => {
      const result = createEnvironmentValue('flag_1', 'env_dev', 'number', 42);

      expect(result.value).toBe(42);
    });

    it('should create environment value with provided json value', () => {
      const jsonValue = { key: 'value' };
      const result = createEnvironmentValue('flag_1', 'env_dev', 'json', jsonValue);

      expect(result.value).toEqual(jsonValue);
    });

    it('should use type default when no value provided for boolean', () => {
      const result = createEnvironmentValue('flag_1', 'env_dev', 'boolean');

      expect(result.value).toBe(false);
    });

    it('should use type default when no value provided for string', () => {
      const result = createEnvironmentValue('flag_1', 'env_dev', 'string');

      expect(result.value).toBe('');
    });

    it('should use type default when no value provided for number', () => {
      const result = createEnvironmentValue('flag_1', 'env_dev', 'number');

      expect(result.value).toBe(0);
    });

    it('should use type default when no value provided for json', () => {
      const result = createEnvironmentValue('flag_1', 'env_dev', 'json');

      expect(result.value).toEqual({});
    });
  });

  describe('updateFlagEnvironmentValue', () => {
    const mockFlag: Flag = {
      id: 'flag_1',
      key: 'test-flag',
      name: 'Test Flag',
      description: 'Test',
      type: 'number',
      defaultValue: 0,
      tags: [],
      environmentValues: {},
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should create new environment value immutably', () => {
      const updated = updateFlagEnvironmentValue(mockFlag, 'env_dev', 42);

      expect(updated).not.toBe(mockFlag);
      expect(updated.environmentValues['env_dev'].value).toBe(42);
      expect(mockFlag.environmentValues['env_dev']).toBeUndefined();
    });

    it('should preserve existing environment values', () => {
      const flagWithValues: Flag = {
        ...mockFlag,
        environmentValues: {
          env_staging: {
            environmentId: 'env_staging',
            flagId: 'flag_1',
            value: 10,
            enabled: true,
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
      };

      const updated = updateFlagEnvironmentValue(flagWithValues, 'env_dev', 42);

      expect(updated.environmentValues['env_staging'].value).toBe(10);
      expect(updated.environmentValues['env_dev'].value).toBe(42);
    });

    it('should update existing environment value', () => {
      const flagWithValues: Flag = {
        ...mockFlag,
        environmentValues: {
          env_dev: {
            environmentId: 'env_dev',
            flagId: 'flag_1',
            value: 10,
            enabled: true,
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
      };

      const updated = updateFlagEnvironmentValue(flagWithValues, 'env_dev', 99);

      expect(updated.environmentValues['env_dev'].value).toBe(99);
      expect(updated.environmentValues['env_dev'].enabled).toBe(true);
    });

    it('should update enabled state when provided', () => {
      const updated = updateFlagEnvironmentValue(mockFlag, 'env_dev', 42, true);

      expect(updated.environmentValues['env_dev'].enabled).toBe(true);
    });

    it('should default enabled to false when creating new environment value', () => {
      const updated = updateFlagEnvironmentValue(mockFlag, 'env_dev', 42);

      expect(updated.environmentValues['env_dev'].enabled).toBe(false);
    });

    it('should update the flag updatedAt timestamp', () => {
      const originalUpdatedAt = mockFlag.updatedAt;
      const updated = updateFlagEnvironmentValue(mockFlag, 'env_dev', 42);

      expect(updated.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should set environment value updatedAt timestamp', () => {
      const updated = updateFlagEnvironmentValue(mockFlag, 'env_dev', 42);

      expect(updated.environmentValues['env_dev'].updatedAt).toBeDefined();
    });
  });
});
