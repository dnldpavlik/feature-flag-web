import { SegmentRule } from './segment-rule.model';

export interface Segment {
  id: string;
  key: string;
  name: string;
  description: string;
  ruleCount: number;
  rules: SegmentRule[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSegmentInput {
  key: string;
  name: string;
  description: string;
}
