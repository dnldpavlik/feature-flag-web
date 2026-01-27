import { Segment } from '../models/segment.model';
import {
  CreateSegmentRuleInput,
  SegmentRule,
  UpdateSegmentRuleInput,
} from '../models/segment-rule.model';

import {
  addRuleToSegment,
  createSegmentRule,
  formatRuleValue,
  getOperatorLabel,
  parseArrayValue,
  removeRuleFromSegment,
  updateRuleInSegment,
  validateRuleInput,
} from './segment-rule.utils';

describe('segment-rule.utils', () => {
  describe('createSegmentRule', () => {
    it('should create a rule with generated ID', () => {
      const input: CreateSegmentRuleInput = {
        attribute: 'email',
        operator: 'contains',
        value: '@company.com',
      };

      const rule = createSegmentRule(input);

      expect(rule.id).toMatch(/^rule_[a-z0-9]{6,8}$/);
    });

    it('should copy input properties to rule', () => {
      const input: CreateSegmentRuleInput = {
        attribute: 'country',
        operator: 'equals',
        value: 'US',
      };

      const rule = createSegmentRule(input);

      expect(rule.attribute).toBe('country');
      expect(rule.operator).toBe('equals');
      expect(rule.value).toBe('US');
    });

    it('should create rule with array value for in operator', () => {
      const input: CreateSegmentRuleInput = {
        attribute: 'plan',
        operator: 'in',
        value: ['pro', 'enterprise'],
      };

      const rule = createSegmentRule(input);

      expect(rule.value).toEqual(['pro', 'enterprise']);
    });

    it('should set createdAt timestamp', () => {
      const before = Date.now();
      const rule = createSegmentRule({
        attribute: 'email',
        operator: 'contains',
        value: 'test',
      });
      const after = Date.now();

      const timestamp = Date.parse(rule.createdAt);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should set updatedAt equal to createdAt on creation', () => {
      const rule = createSegmentRule({
        attribute: 'email',
        operator: 'contains',
        value: 'test',
      });

      expect(rule.updatedAt).toBe(rule.createdAt);
    });
  });

  describe('addRuleToSegment', () => {
    const baseSegment: Segment = {
      id: 'seg_123',
      key: 'beta-testers',
      name: 'Beta Testers',
      description: 'Users in beta program',
      ruleCount: 0,
      rules: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const mockRule: SegmentRule = {
      id: 'rule_abc',
      attribute: 'email',
      operator: 'contains',
      value: '@beta.com',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    };

    it('should add rule to empty segment immutably', () => {
      const result = addRuleToSegment(baseSegment, mockRule);

      expect(result).not.toBe(baseSegment);
      expect(result.rules).toHaveLength(1);
      expect(result.rules[0]).toEqual(mockRule);
      expect(baseSegment.rules).toHaveLength(0);
    });

    it('should increment ruleCount', () => {
      const result = addRuleToSegment(baseSegment, mockRule);

      expect(result.ruleCount).toBe(1);
    });

    it('should preserve existing rules', () => {
      const existingRule: SegmentRule = {
        id: 'rule_existing',
        attribute: 'country',
        operator: 'equals',
        value: 'US',
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z',
      };

      const segmentWithRule: Segment = {
        ...baseSegment,
        rules: [existingRule],
        ruleCount: 1,
      };

      const result = addRuleToSegment(segmentWithRule, mockRule);

      expect(result.rules).toHaveLength(2);
      expect(result.rules[0]).toEqual(existingRule);
      expect(result.rules[1]).toEqual(mockRule);
      expect(result.ruleCount).toBe(2);
    });

    it('should update segment updatedAt timestamp', () => {
      const result = addRuleToSegment(baseSegment, mockRule);

      expect(result.updatedAt).not.toBe(baseSegment.updatedAt);
    });
  });

  describe('updateRuleInSegment', () => {
    const existingRule: SegmentRule = {
      id: 'rule_abc',
      attribute: 'email',
      operator: 'contains',
      value: '@old.com',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    };

    const baseSegment: Segment = {
      id: 'seg_123',
      key: 'beta-testers',
      name: 'Beta Testers',
      description: 'Users in beta program',
      ruleCount: 1,
      rules: [existingRule],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should update rule attribute immutably', () => {
      const updates: UpdateSegmentRuleInput = { attribute: 'country' };

      const result = updateRuleInSegment(baseSegment, 'rule_abc', updates);

      expect(result).not.toBe(baseSegment);
      expect(result.rules[0].attribute).toBe('country');
      expect(baseSegment.rules[0].attribute).toBe('email');
    });

    it('should update rule operator', () => {
      const updates: UpdateSegmentRuleInput = { operator: 'equals' };

      const result = updateRuleInSegment(baseSegment, 'rule_abc', updates);

      expect(result.rules[0].operator).toBe('equals');
    });

    it('should update rule value', () => {
      const updates: UpdateSegmentRuleInput = { value: '@new.com' };

      const result = updateRuleInSegment(baseSegment, 'rule_abc', updates);

      expect(result.rules[0].value).toBe('@new.com');
    });

    it('should preserve unchanged properties', () => {
      const updates: UpdateSegmentRuleInput = { value: '@new.com' };

      const result = updateRuleInSegment(baseSegment, 'rule_abc', updates);

      expect(result.rules[0].attribute).toBe('email');
      expect(result.rules[0].operator).toBe('contains');
      expect(result.rules[0].createdAt).toBe(existingRule.createdAt);
    });

    it('should update rule updatedAt timestamp', () => {
      const updates: UpdateSegmentRuleInput = { value: '@new.com' };

      const result = updateRuleInSegment(baseSegment, 'rule_abc', updates);

      expect(result.rules[0].updatedAt).not.toBe(existingRule.updatedAt);
    });

    it('should update segment updatedAt timestamp', () => {
      const updates: UpdateSegmentRuleInput = { value: '@new.com' };

      const result = updateRuleInSegment(baseSegment, 'rule_abc', updates);

      expect(result.updatedAt).not.toBe(baseSegment.updatedAt);
    });

    it('should not modify other rules', () => {
      const otherRule: SegmentRule = {
        id: 'rule_other',
        attribute: 'plan',
        operator: 'equals',
        value: 'pro',
        createdAt: '2024-01-12T00:00:00Z',
        updatedAt: '2024-01-12T00:00:00Z',
      };

      const segmentWithMultipleRules: Segment = {
        ...baseSegment,
        rules: [existingRule, otherRule],
        ruleCount: 2,
      };

      const result = updateRuleInSegment(segmentWithMultipleRules, 'rule_abc', {
        value: '@new.com',
      });

      expect(result.rules[1]).toEqual(otherRule);
    });

    it('should return segment unchanged if rule not found', () => {
      const result = updateRuleInSegment(baseSegment, 'nonexistent', {
        value: 'test',
      });

      expect(result).toEqual(baseSegment);
    });
  });

  describe('removeRuleFromSegment', () => {
    const ruleToRemove: SegmentRule = {
      id: 'rule_remove',
      attribute: 'email',
      operator: 'contains',
      value: '@test.com',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    };

    const ruleToKeep: SegmentRule = {
      id: 'rule_keep',
      attribute: 'country',
      operator: 'equals',
      value: 'US',
      createdAt: '2024-01-11T00:00:00Z',
      updatedAt: '2024-01-11T00:00:00Z',
    };

    const baseSegment: Segment = {
      id: 'seg_123',
      key: 'beta-testers',
      name: 'Beta Testers',
      description: 'Users in beta program',
      ruleCount: 2,
      rules: [ruleToRemove, ruleToKeep],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should remove rule immutably', () => {
      const result = removeRuleFromSegment(baseSegment, 'rule_remove');

      expect(result).not.toBe(baseSegment);
      expect(result.rules).toHaveLength(1);
      expect(baseSegment.rules).toHaveLength(2);
    });

    it('should decrement ruleCount', () => {
      const result = removeRuleFromSegment(baseSegment, 'rule_remove');

      expect(result.ruleCount).toBe(1);
    });

    it('should keep other rules intact', () => {
      const result = removeRuleFromSegment(baseSegment, 'rule_remove');

      expect(result.rules[0]).toEqual(ruleToKeep);
    });

    it('should update segment updatedAt timestamp', () => {
      const result = removeRuleFromSegment(baseSegment, 'rule_remove');

      expect(result.updatedAt).not.toBe(baseSegment.updatedAt);
    });

    it('should return segment unchanged if rule not found', () => {
      const result = removeRuleFromSegment(baseSegment, 'nonexistent');

      expect(result).toEqual(baseSegment);
    });
  });

  describe('validateRuleInput', () => {
    it('should return valid for complete input', () => {
      const input: CreateSegmentRuleInput = {
        attribute: 'email',
        operator: 'contains',
        value: '@test.com',
      };

      const result = validateRuleInput(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return error for empty attribute', () => {
      const input: CreateSegmentRuleInput = {
        attribute: '',
        operator: 'equals',
        value: 'test',
      };

      const result = validateRuleInput(input);

      expect(result.valid).toBe(false);
      expect(result.errors.attribute).toBe('Attribute is required');
    });

    it('should return error for whitespace-only attribute', () => {
      const input: CreateSegmentRuleInput = {
        attribute: '   ',
        operator: 'equals',
        value: 'test',
      };

      const result = validateRuleInput(input);

      expect(result.valid).toBe(false);
      expect(result.errors.attribute).toBe('Attribute is required');
    });

    it('should return error for empty string value', () => {
      const input: CreateSegmentRuleInput = {
        attribute: 'email',
        operator: 'equals',
        value: '',
      };

      const result = validateRuleInput(input);

      expect(result.valid).toBe(false);
      expect(result.errors.value).toBe('Value is required');
    });

    it('should return error for empty array value', () => {
      const input: CreateSegmentRuleInput = {
        attribute: 'plan',
        operator: 'in',
        value: [],
      };

      const result = validateRuleInput(input);

      expect(result.valid).toBe(false);
      expect(result.errors.value).toBe('At least one value is required');
    });

    it('should accept array value for in operator', () => {
      const input: CreateSegmentRuleInput = {
        attribute: 'plan',
        operator: 'in',
        value: ['pro', 'enterprise'],
      };

      const result = validateRuleInput(input);

      expect(result.valid).toBe(true);
    });

    it('should accept array value for not_in operator', () => {
      const input: CreateSegmentRuleInput = {
        attribute: 'country',
        operator: 'not_in',
        value: ['CN', 'RU'],
      };

      const result = validateRuleInput(input);

      expect(result.valid).toBe(true);
    });

    it('should return multiple errors when multiple fields invalid', () => {
      const input: CreateSegmentRuleInput = {
        attribute: '',
        operator: 'equals',
        value: '',
      };

      const result = validateRuleInput(input);

      expect(result.valid).toBe(false);
      expect(result.errors.attribute).toBeDefined();
      expect(result.errors.value).toBeDefined();
    });
  });

  describe('formatRuleValue', () => {
    it('should return string value as is', () => {
      expect(formatRuleValue('equals', 'US')).toBe('US');
    });

    it('should format array value with commas', () => {
      expect(formatRuleValue('in', ['pro', 'enterprise'])).toBe(
        'pro, enterprise'
      );
    });

    it('should handle single item array', () => {
      expect(formatRuleValue('not_in', ['admin'])).toBe('admin');
    });

    it('should handle empty array', () => {
      expect(formatRuleValue('in', [])).toBe('');
    });
  });

  describe('parseArrayValue', () => {
    it('should parse comma-separated string into array', () => {
      expect(parseArrayValue('pro, enterprise, basic')).toEqual([
        'pro',
        'enterprise',
        'basic',
      ]);
    });

    it('should trim whitespace from values', () => {
      expect(parseArrayValue('  pro  ,  enterprise  ')).toEqual([
        'pro',
        'enterprise',
      ]);
    });

    it('should filter out empty values', () => {
      expect(parseArrayValue('pro,, enterprise,')).toEqual([
        'pro',
        'enterprise',
      ]);
    });

    it('should handle single value', () => {
      expect(parseArrayValue('pro')).toEqual(['pro']);
    });

    it('should return empty array for empty string', () => {
      expect(parseArrayValue('')).toEqual([]);
    });

    it('should return empty array for whitespace only', () => {
      expect(parseArrayValue('   ')).toEqual([]);
    });
  });

  describe('getOperatorLabel', () => {
    it('should return "equals" for equals operator', () => {
      expect(getOperatorLabel('equals')).toBe('equals');
    });

    it('should return "does not equal" for not_equals operator', () => {
      expect(getOperatorLabel('not_equals')).toBe('does not equal');
    });

    it('should return "contains" for contains operator', () => {
      expect(getOperatorLabel('contains')).toBe('contains');
    });

    it('should return "does not contain" for not_contains operator', () => {
      expect(getOperatorLabel('not_contains')).toBe('does not contain');
    });

    it('should return "starts with" for starts_with operator', () => {
      expect(getOperatorLabel('starts_with')).toBe('starts with');
    });

    it('should return "ends with" for ends_with operator', () => {
      expect(getOperatorLabel('ends_with')).toBe('ends with');
    });

    it('should return "is one of" for in operator', () => {
      expect(getOperatorLabel('in')).toBe('is one of');
    });

    it('should return "is not one of" for not_in operator', () => {
      expect(getOperatorLabel('not_in')).toBe('is not one of');
    });

    it('should return the operator string itself for unknown operator', () => {
      expect(getOperatorLabel('unknown_op' as never)).toBe('unknown_op');
    });
  });
});
