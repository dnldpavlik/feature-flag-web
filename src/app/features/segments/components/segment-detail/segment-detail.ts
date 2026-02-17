import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { ButtonComponent } from '@watt/ui';
import { CreateSegmentRuleInput, UpdateSegmentRuleInput } from '../../models/segment-rule.model';
import { UpdateSegmentInput } from '../../api/segment.api';
import { SegmentStore } from '../../store/segment.store';
import { RuleBuilderComponent } from '../rule-builder/rule-builder';
import { RuleRowComponent } from '../rule-row/rule-row';

@Component({
  selector: 'app-segment-detail',
  imports: [RouterLink, ButtonComponent, RuleRowComponent, RuleBuilderComponent],
  templateUrl: './segment-detail.html',
  styleUrl: './segment-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly segmentStore = inject(SegmentStore);

  private readonly segmentId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('segmentId') ?? '')),
  );

  protected readonly segment = computed(() => {
    const id = this.segmentId();
    if (!id) {
      return undefined;
    }
    return this.segmentStore.getSegmentById(id);
  });

  protected readonly isEditing = signal(false);
  protected readonly editName = signal('');
  protected readonly editKey = signal('');
  protected readonly editDescription = signal('');

  protected enterEditMode(): void {
    const seg = this.segment();
    if (!seg) {
      return;
    }

    this.editName.set(seg.name);
    this.editKey.set(seg.key);
    this.editDescription.set(seg.description);
    this.isEditing.set(true);
  }

  protected cancelEdit(): void {
    this.isEditing.set(false);
  }

  protected saveEdit(): void {
    const id = this.segmentId();
    if (!id) {
      return;
    }

    const updates: UpdateSegmentInput = {
      name: this.editName().trim(),
      key: this.editKey().trim(),
      description: this.editDescription().trim(),
    };

    this.segmentStore.updateSegment(id, updates);
    this.isEditing.set(false);
  }

  protected onNameInput(event: Event): void {
    this.editName.set((event.target as HTMLInputElement).value);
  }

  protected onKeyInput(event: Event): void {
    this.editKey.set((event.target as HTMLInputElement).value);
  }

  protected onDescriptionInput(event: Event): void {
    this.editDescription.set((event.target as HTMLTextAreaElement).value);
  }

  protected onRuleAdded(input: CreateSegmentRuleInput): void {
    const id = this.segmentId();
    if (!id) {
      return;
    }
    this.segmentStore.addRule(id, input);
  }

  protected onRuleUpdated(ruleId: string, updates: UpdateSegmentRuleInput): void {
    const id = this.segmentId();
    if (!id) {
      return;
    }
    this.segmentStore.updateRule(id, ruleId, updates);
  }

  protected onRuleRemoved(ruleId: string): void {
    const id = this.segmentId();
    if (!id) {
      return;
    }
    this.segmentStore.removeRule(id, ruleId);
  }
}
