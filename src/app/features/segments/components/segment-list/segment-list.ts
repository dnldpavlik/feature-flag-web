import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  ButtonComponent,
  CardComponent,
  DataTableComponent,
  EmptyStateComponent,
  FormFieldComponent,
  PageHeaderComponent,
  UiColDirective,
} from '@watt/ui';
import { SearchStore } from '@/app/shared/store/search.store';
import { SegmentStore } from '@/app/features/segments/store/segment.store';
import { textFilter } from '@/app/shared/utils/filter.utils';

@Component({
  selector: 'app-segment-list',
  imports: [
    ButtonComponent,
    CardComponent,
    DataTableComponent,
    DatePipe,
    EmptyStateComponent,
    FormFieldComponent,
    PageHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
    UiColDirective,
  ],
  templateUrl: './segment-list.html',
  styleUrl: './segment-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentListComponent {
  private readonly segmentStore = inject(SegmentStore);
  private readonly searchStore = inject(SearchStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly segments = this.segmentStore.segments;
  protected readonly searchQuery = this.searchStore.normalizedQuery;
  protected readonly filteredSegments = computed(() => {
    const query = this.searchQuery();
    return this.segments().filter(textFilter(['name', 'key', 'description'], query));
  });

  protected readonly form = this.fb.group({
    name: [''],
    key: [''],
    description: [''],
  });

  protected canAdd(): boolean {
    const { name, key } = this.form.getRawValue();
    return name.trim().length > 0 && key.trim().length > 0;
  }

  protected addSegment(): void {
    if (!this.canAdd()) {
      return;
    }

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
