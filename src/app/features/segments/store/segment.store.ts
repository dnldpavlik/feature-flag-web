import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BaseCrudStore } from '@/app/shared/store/base-crud.store';
import { ToastService } from '@watt/ui';
import { AuditLogger } from '@/app/features/audit/services/audit-logger.service';
import {
  CreateSegmentRuleInput,
  UpdateSegmentRuleInput,
} from '@/app/features/segments/models/segment-rule.model';
import { CreateSegmentInput, Segment } from '@/app/features/segments/models/segment.model';
import { SegmentApi, UpdateSegmentInput } from '../api/segment.api';

@Injectable({ providedIn: 'root' })
export class SegmentStore extends BaseCrudStore<Segment> {
  private readonly api = inject(SegmentApi);
  private readonly toast = inject(ToastService);
  private readonly logAudit = inject(AuditLogger).forResource('segment');

  constructor() {
    super({
      idPrefix: 'seg',
      initialData: [],
      allowDeleteLast: false,
    });
  }

  /** Alias for items to maintain backward compatibility */
  readonly segments = this.items;

  /** Alias for count to maintain backward compatibility */
  readonly segmentCount = this.count;

  /** Load segments from API */
  async loadSegments(): Promise<void> {
    await this.loadFromApi(this.api.getAll());
  }

  /** Find segment by ID */
  getSegmentById(segmentId: string): Segment | undefined {
    return this.getById(segmentId);
  }

  /** Add a new segment via API */
  async addSegment(input: CreateSegmentInput): Promise<void> {
    try {
      const created = await firstValueFrom(this.api.create(input));
      this._items.update((items) => [...items, created]);
      this.toast.success('Segment created');
      this.logAudit({
        action: 'created',
        resourceId: created.id,
        resourceName: created.name,
        details: `Created segment "${created.key}"`,
      });
    } catch {
      this.toast.error('Failed to create segment');
    }
  }

  /** Update segment properties via API */
  async updateSegment(segmentId: string, updates: UpdateSegmentInput): Promise<void> {
    try {
      const updated = await firstValueFrom(this.api.update(segmentId, updates));
      this.updateItem(segmentId, updated);
      this.toast.success('Segment updated');
      const changedFields = Object.keys(updates).join(', ');
      this.logAudit({
        action: 'updated',
        resourceId: segmentId,
        resourceName: updated.name,
        details: `Updated segment fields: ${changedFields}`,
      });
    } catch {
      this.toast.error('Failed to update segment');
    }
  }

  /** Delete a segment via API */
  async deleteSegment(segmentId: string): Promise<void> {
    if (this._items().length <= 1) return;

    const segment = this.getById(segmentId);
    if (!segment) return;

    try {
      await firstValueFrom(this.api.delete(segmentId));
      this.deleteItem(segmentId);
      this.toast.success('Segment deleted');
      this.logAudit({
        action: 'deleted',
        resourceId: segmentId,
        resourceName: segment.name,
        details: `Deleted segment "${segment.key}"`,
      });
    } catch {
      this.toast.error('Failed to delete segment');
    }
  }

  /** Add a rule to a segment via API */
  async addRule(segmentId: string, input: CreateSegmentRuleInput): Promise<void> {
    try {
      const updated = await firstValueFrom(this.api.addRule(segmentId, input));
      this._items.update((segments) =>
        segments.map((segment) => (segment.id === segmentId ? updated : segment)),
      );
      this.toast.success('Rule added');
    } catch {
      this.toast.error('Failed to add rule');
    }
  }

  /** Update a rule within a segment via API */
  async updateRule(
    segmentId: string,
    ruleId: string,
    updates: UpdateSegmentRuleInput,
  ): Promise<void> {
    try {
      const updated = await firstValueFrom(this.api.updateRule(segmentId, ruleId, updates));
      this._items.update((segments) =>
        segments.map((segment) => (segment.id === segmentId ? updated : segment)),
      );
    } catch {
      this.toast.error('Failed to update rule');
    }
  }

  /** Remove a rule from a segment via API */
  async removeRule(segmentId: string, ruleId: string): Promise<void> {
    try {
      const updated = await firstValueFrom(this.api.deleteRule(segmentId, ruleId));
      this._items.update((segments) =>
        segments.map((segment) => (segment.id === segmentId ? updated : segment)),
      );
      this.toast.success('Rule removed');
    } catch {
      this.toast.error('Failed to remove rule');
    }
  }
}
