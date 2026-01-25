import { Injectable, computed, signal } from '@angular/core';

import { createId, createTimestamp } from '@/app/shared/utils/id.utils';
import { CreateSegmentInput, Segment } from '@/app/features/segments/models/segment.model';

@Injectable({ providedIn: 'root' })
export class SegmentStore {
  private readonly _segments = signal<Segment[]>([
    {
      id: 'seg_beta',
      key: 'beta-testers',
      name: 'Beta Testers',
      description: 'Internal and external testers for early feature access.',
      ruleCount: 3,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    },
    {
      id: 'seg_internal',
      key: 'internal-users',
      name: 'Internal Users',
      description: 'Employees and trusted partners.',
      ruleCount: 2,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    },
  ]);

  readonly segments = this._segments.asReadonly();

  readonly segmentCount = computed(() => this._segments().length);

  addSegment(input: CreateSegmentInput): void {
    const stamp = createTimestamp();
    const segmentId = createId('seg');

    const newSegment: Segment = {
      id: segmentId,
      key: input.key,
      name: input.name,
      description: input.description,
      ruleCount: 0,
      createdAt: stamp,
      updatedAt: stamp,
    };

    this._segments.update((segments) => [...segments, newSegment]);
  }

  deleteSegment(segmentId: string): void {
    if (this._segments().length <= 1) return;
    this._segments.update((segments) => segments.filter((segment) => segment.id !== segmentId));
  }
}
