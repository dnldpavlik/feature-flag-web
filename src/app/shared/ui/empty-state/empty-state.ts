import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Empty state size variants */
export type EmptyStateSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-empty-state',
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  /** The title text displayed in the empty state */
  readonly title = input.required<string>();

  /** The descriptive message displayed below the title */
  readonly message = input.required<string>();

  /** The size variant of the empty state */
  readonly size = input<EmptyStateSize>('md');

  /** Computed CSS classes for the container */
  protected readonly containerClasses = computed(() => ({
    'empty-state': true,
    [`empty-state--${this.size()}`]: true,
  }));
}
