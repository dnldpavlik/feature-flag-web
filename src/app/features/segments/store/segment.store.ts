import { Injectable, computed, signal } from '@angular/core';

import { createId, createTimestamp } from '@/app/shared/utils/id.utils';
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

@Injectable({ providedIn: 'root' })
export class SegmentStore {
  private readonly _segments = signal<Segment[]>([
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
  ]);

  readonly segments = this._segments.asReadonly();

  readonly segmentCount = computed(() => this._segments().length);

  getSegmentById(segmentId: string): Segment | undefined {
    return this._segments().find((s) => s.id === segmentId);
  }

  addSegment(input: CreateSegmentInput): void {
    const stamp = createTimestamp();
    const segmentId = createId('seg');

    const newSegment: Segment = {
      id: segmentId,
      key: input.key,
      name: input.name,
      description: input.description,
      ruleCount: 0,
      rules: [],
      createdAt: stamp,
      updatedAt: stamp,
    };

    this._segments.update((segments) => [...segments, newSegment]);
  }

  updateSegment(segmentId: string, updates: UpdateSegmentInput): void {
    this._segments.update((segments) =>
      segments.map((segment) =>
        segment.id === segmentId
          ? { ...segment, ...updates, updatedAt: createTimestamp() }
          : segment
      )
    );
  }

  deleteSegment(segmentId: string): void {
    if (this._segments().length <= 1) return;
    this._segments.update((segments) => segments.filter((segment) => segment.id !== segmentId));
  }

  addRule(segmentId: string, input: CreateSegmentRuleInput): void {
    const rule = createSegmentRule(input);
    this._segments.update((segments) =>
      segments.map((segment) =>
        segment.id === segmentId ? addRuleToSegment(segment, rule) : segment
      )
    );
  }

  updateRule(segmentId: string, ruleId: string, updates: UpdateSegmentRuleInput): void {
    this._segments.update((segments) =>
      segments.map((segment) =>
        segment.id === segmentId ? updateRuleInSegment(segment, ruleId, updates) : segment
      )
    );
  }

  removeRule(segmentId: string, ruleId: string): void {
    this._segments.update((segments) =>
      segments.map((segment) =>
        segment.id === segmentId ? removeRuleFromSegment(segment, ruleId) : segment
      )
    );
  }
}
