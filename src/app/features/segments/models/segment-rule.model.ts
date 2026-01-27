/**
 * Operators for segment rule matching.
 */
export type RuleOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in';

/**
 * A rule that defines membership criteria for a segment.
 */
export interface SegmentRule {
  id: string;
  attribute: string;
  operator: RuleOperator;
  value: string | string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new segment rule.
 */
export interface CreateSegmentRuleInput {
  attribute: string;
  operator: RuleOperator;
  value: string | string[];
}

/**
 * Input for updating an existing segment rule.
 */
export interface UpdateSegmentRuleInput {
  attribute?: string;
  operator?: RuleOperator;
  value?: string | string[];
}

/**
 * Common user attributes for targeting rules.
 */
export const COMMON_ATTRIBUTES = [
  { value: 'email', label: 'Email' },
  { value: 'country', label: 'Country' },
  { value: 'plan', label: 'Plan' },
  { value: 'role', label: 'Role' },
  { value: 'company', label: 'Company' },
  { value: 'custom', label: 'Custom...' },
] as const;

/**
 * Operator options with human-readable labels.
 */
export const OPERATOR_OPTIONS: readonly { value: RuleOperator; label: string }[] = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: 'does not contain' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
  { value: 'in', label: 'is one of' },
  { value: 'not_in', label: 'is not one of' },
] as const;
