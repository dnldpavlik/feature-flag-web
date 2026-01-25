import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { SearchStore } from '../../../../shared/store/search.store';
import { SegmentStore } from '../../store/segment.store';

@Component({
  selector: 'app-segment-list',
  imports: [DatePipe, FormsModule, ButtonComponent, EmptyStateComponent],
  templateUrl: './segment-list.html',
  styleUrl: './segment-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentListComponent {
  private readonly segmentStore = inject(SegmentStore);
  private readonly searchStore = inject(SearchStore);

  protected readonly segments = this.segmentStore.segments;
  protected readonly searchQuery = computed(() => this.searchStore.query().trim().toLowerCase());
  protected readonly filteredSegments = computed(() => {
    const query = this.searchQuery();
    if (!query) return this.segments();

    return this.segments().filter((segment) =>
      `${segment.name} ${segment.key} ${segment.description}`.toLowerCase().includes(query)
    );
  });

  protected name = '';
  protected key = '';
  protected description = '';

  protected canAdd(): boolean {
    return this.name.trim().length > 0 && this.key.trim().length > 0;
  }

  protected addSegment(): void {
    if (!this.canAdd()) return;

    this.segmentStore.addSegment({
      name: this.name.trim(),
      key: this.key.trim(),
      description: this.description.trim(),
    });

    this.name = '';
    this.key = '';
    this.description = '';
  }

  protected deleteSegment(segmentId: string): void {
    this.segmentStore.deleteSegment(segmentId);
  }
}
