import { createId } from '@/app/shared/utils/id.utils';
import { TimeProvider, defaultTimeProvider } from '@/app/core/time/time.service';
import { Segment } from '../models/segment.model';
import {
  CreateSegmentRuleInput,
  OPERATOR_OPTIONS,
  RuleOperator,
  SegmentRule,
  UpdateSegmentRuleInput,
} from '../models/segment-rule.model';

/**
 * Validation result for rule input.
 */
export interface RuleValidationResult {
  valid: boolean;
  errors: Partial<Record<'attribute' | 'operator' | 'value', string>>;
}

/**
 * Creates a new segment rule from input.
 */
export const createSegmentRule = (
  input: CreateSegmentRuleInput,
  timeProvider: TimeProvider = defaultTimeProvider,
): SegmentRule => {
  const now = timeProvider.now();
  return {
    id: createId('rule'),
    attribute: input.attribute,
    operator: input.operator,
    value: input.value,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Adds a rule to a segment immutably.
 */
export const addRuleToSegment = (
  segment: Segment,
  rule: SegmentRule,
  timeProvider: TimeProvider = defaultTimeProvider,
): Segment => ({
  ...segment,
  rules: [...segment.rules, rule],
  ruleCount: segment.ruleCount + 1,
  updatedAt: timeProvider.now(),
});

/**
 * Updates a rule in a segment immutably.
 * Returns the segment unchanged if the rule is not found.
 */
export const updateRuleInSegment = (
  segment: Segment,
  ruleId: string,
  updates: UpdateSegmentRuleInput,
  timeProvider: TimeProvider = defaultTimeProvider,
): Segment => {
  const ruleIndex = segment.rules.findIndex((r) => r.id === ruleId);

  if (ruleIndex === -1) {
    return segment;
  }

  const now = timeProvider.now();
  const existingRule = segment.rules[ruleIndex];
  const updatedRule: SegmentRule = {
    ...existingRule,
    ...updates,
    updatedAt: now,
  };

  const newRules = [...segment.rules];
  newRules[ruleIndex] = updatedRule;

  return {
    ...segment,
    rules: newRules,
    updatedAt: now,
  };
};

/**
 * Removes a rule from a segment immutably.
 * Returns the segment unchanged if the rule is not found.
 */
export const removeRuleFromSegment = (
  segment: Segment,
  ruleId: string,
  timeProvider: TimeProvider = defaultTimeProvider,
): Segment => {
  const ruleExists = segment.rules.some((r) => r.id === ruleId);

  if (!ruleExists) {
    return segment;
  }

  return {
    ...segment,
    rules: segment.rules.filter((r) => r.id !== ruleId),
    ruleCount: segment.ruleCount - 1,
    updatedAt: timeProvider.now(),
  };
};

/**
 * Validates rule input and returns validation result.
 */
export const validateRuleInput = (input: CreateSegmentRuleInput): RuleValidationResult => {
  const errors: RuleValidationResult['errors'] = {};

  if (!input.attribute || input.attribute.trim() === '') {
    errors.attribute = 'Attribute is required';
  }

  if (Array.isArray(input.value)) {
    if (input.value.length === 0) {
      errors.value = 'At least one value is required';
    }
  } else if (!input.value || input.value.trim() === '') {
    errors.value = 'Value is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Formats a rule value for display.
 */
export const formatRuleValue = (operator: RuleOperator, value: string | string[]): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return value;
};

/**
 * Parses a comma-separated string into an array of values.
 */
export const parseArrayValue = (input: string): string[] =>
  input
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '');

/**
 * Gets the human-readable label for an operator.
 */
export const getOperatorLabel = (operator: RuleOperator): string => {
  const option = OPERATOR_OPTIONS.find((o) => o.value === operator);
  return option?.label ?? operator;
};
