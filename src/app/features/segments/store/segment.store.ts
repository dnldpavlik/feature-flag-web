import { Injectable } from '@angular/core';

import { BaseCrudStore } from '@/app/shared/store/base-crud.store';
import { createTimestamp } from '@/app/shared/utils/id.utils';
import {
  CreateSegmentRuleInput,
  UpdateSegmentRuleInput,
} from '@/app/features/segments/models/segment-rule.model';
import { CreateSegmentInput, Segment } from '@/app/features/segments/models/segment.model';
import {
  addRuleToSegment,
  createSegmentRule,
  removeRuleFromSegment,
  updateRuleInSegment,
} from '../utils/segment-rule.utils';

export interface UpdateSegmentInput {
  name?: string;
  key?: string;
  description?: string;
}

const INITIAL_SEGMENTS: Segment[] = [
  {
    id: 'seg_beta',
    key: 'beta-testers',
    name: 'Beta Testers',
    description: 'Internal and external testers for early feature access.',
    ruleCount: 2,
    rules: [
      {
        id: 'rule_beta1',
        attribute: 'email',
        operator: 'contains',
        value: '@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'rule_beta2',
        attribute: 'plan',
        operator: 'in',
        value: ['beta', 'early-access'],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ],
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  },
  {
    id: 'seg_internal',
    key: 'internal-users',
    name: 'Internal Users',
    description: 'Employees and trusted partners.',
    ruleCount: 1,
    rules: [
      {
        id: 'rule_int1',
        attribute: 'email',
        operator: 'ends_with',
        value: '@internal.corp',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  },
];

@Injectable({ providedIn: 'root' })
export class SegmentStore extends BaseCrudStore<Segment> {
  constructor() {
    super({
      idPrefix: 'seg',
      initialData: INITIAL_SEGMENTS,
      allowDeleteLast: false,
    });
  }

  /** Alias for items to maintain backward compatibility */
  readonly segments = this.items;

  /** Alias for count to maintain backward compatibility */
  readonly segmentCount = this.count;

  /** Find segment by ID */
  getSegmentById(segmentId: string): Segment | undefined {
    return this.getById(segmentId);
  }

  /** Add a new segment */
  addSegment(input: CreateSegmentInput): void {
    this.addItem({
      key: input.key,
      name: input.name,
      description: input.description,
      ruleCount: 0,
      rules: [],
    });
  }

  /** Update segment properties */
  updateSegment(segmentId: string, updates: UpdateSegmentInput): void {
    this.updateItem(segmentId, updates);
  }

  /** Delete a segment */
  deleteSegment(segmentId: string): void {
    this.deleteItem(segmentId);
  }

  /** Add a rule to a segment */
  addRule(segmentId: string, input: CreateSegmentRuleInput): void {
    const rule = createSegmentRule(input);
    this._items.update((segments) =>
      segments.map((segment) =>
        segment.id === segmentId ? addRuleToSegment(segment, rule) : segment,
      ),
    );
  }

  /** Update a rule within a segment */
  updateRule(segmentId: string, ruleId: string, updates: UpdateSegmentRuleInput): void {
    this._items.update((segments) =>
      segments.map((segment) =>
        segment.id === segmentId ? updateRuleInSegment(segment, ruleId, updates) : segment,
      ),
    );
  }

  /** Remove a rule from a segment */
  removeRule(segmentId: string, ruleId: string): void {
    this._items.update((segments) =>
      segments.map((segment) =>
        segment.id === segmentId ? removeRuleFromSegment(segment, ruleId) : segment,
      ),
    );
  }
}
