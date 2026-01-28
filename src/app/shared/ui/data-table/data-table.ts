import { Component, contentChildren, input, computed, signal, output, ChangeDetectionStrategy } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { SortDirection } from './sort-direction.type';
import type { SortState } from './sort-state.interface';
import { sortRows } from './sort-rows';
import { nextSortState } from './next-sort-state';
import { UiColDirective } from './ui-col.directive';

@Component({
  selector: 'app-ui-data-table',
  imports: [NgTemplateOutlet],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': `'region'`,
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.tabindex]': '0',
  },
})
export class DataTableComponent<T = unknown> {
  readonly items = input<readonly T[]>([]);
  readonly ariaLabel = input<string>('Data table');
  readonly emptyText = input<string>('No rows.');
  readonly maxHeight = input<string | number>('60vh');
  readonly initialSort = input<SortState | null>(null);

  readonly cols = contentChildren(UiColDirective<T>);

  private readonly userSort = signal<SortState | null>(null);
  readonly sortChange = output<SortState | null>();

  private readonly initialResolved = computed<SortState | null>(() => {
    const init = this.initialSort();
    if (!init) return null;
    const col = this.cols().find((c) => c.key() === init.key && c.sortable() !== false);
    return col ? init : null;
  });

  private readonly activeSort = computed<SortState | null>(
    () => this.userSort() ?? this.initialResolved()
  );

  readonly rows = computed<readonly T[]>(() =>
    sortRows(this.items() ?? [], this.activeSort(), this.cols())
  );

  onHeaderClick(col: UiColDirective<T>): void {
    if (col.sortable() === false) return;
    const next = nextSortState(this.activeSort(), col.key());
    this.userSort.set(next);
    this.sortChange.emit(next);
  }

  isSorted(col: UiColDirective<T>): boolean {
    const s = this.activeSort();
    return !!s && s.key === col.key();
  }

  sortDirection(col: UiColDirective<T>): SortDirection | null {
    const s = this.activeSort();
    return s && s.key === col.key() ? s.dir : null;
  }

  sortSymbol(col: UiColDirective<T>): string {
    const dir = this.sortDirection(col);
    if (!dir) return '';
    return dir === 'asc' ? '▲' : '▼';
  }

  trackRow(index: number, row: T) {
    return (row as Record<string, unknown>)?.['id'] ?? row ?? index;
  }
}
