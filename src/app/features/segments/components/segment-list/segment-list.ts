import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';

import { ButtonComponent } from '@/app/shared/ui/button/button';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { SearchStore } from '@/app/shared/store/search.store';
import { SegmentStore } from '@/app/features/segments/store/segment.store';

@Component({
  selector: 'app-segment-list',
  imports: [DatePipe, ReactiveFormsModule, ButtonComponent, EmptyStateComponent],
  templateUrl: './segment-list.html',
  styleUrl: './segment-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentListComponent {
  private readonly segmentStore = inject(SegmentStore);
  private readonly searchStore = inject(SearchStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly segments = this.segmentStore.segments;
  protected readonly searchQuery = computed(() => this.searchStore.query().trim().toLowerCase());
  protected readonly filteredSegments = computed(() => {
    const query = this.searchQuery();
    if (!query) return this.segments();

    return this.segments().filter((segment) =>
      `${segment.name} ${segment.key} ${segment.description}`.toLowerCase().includes(query),
    );
  });

  protected readonly form = this.fb.group({
    name: [''],
    key: [''],
    description: [''],
  });

  // Backward compatibility getters/setters for tests
  get name(): string {
    return this.form.controls.name.value;
  }
  set name(value: string) {
    this.form.controls.name.setValue(value);
  }

  get key(): string {
    return this.form.controls.key.value;
  }
  set key(value: string) {
    this.form.controls.key.setValue(value);
  }

  get description(): string {
    return this.form.controls.description.value;
  }
  set description(value: string) {
    this.form.controls.description.setValue(value);
  }

  protected canAdd(): boolean {
    const { name, key } = this.form.getRawValue();
    return name.trim().length > 0 && key.trim().length > 0;
  }

  protected addSegment(): void {
    if (!this.canAdd()) return;

    const { name, key, description } = this.form.getRawValue();
    this.segmentStore.addSegment({
      name: name.trim(),
      key: key.trim(),
      description: description.trim(),
    });

    this.form.reset();
  }

  protected deleteSegment(segmentId: string): void {
    this.segmentStore.deleteSegment(segmentId);
  }
}
