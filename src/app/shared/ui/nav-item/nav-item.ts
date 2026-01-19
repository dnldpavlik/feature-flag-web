import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent, IconName } from '../icon/icon';

@Component({
  selector: 'app-nav-item',
  imports: [RouterLink, IconComponent],
  templateUrl: './nav-item.html',
  styleUrl: './nav-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavItemComponent {
  /** The display label for the nav item */
  readonly label = input.required<string>();

  /** The route to navigate to */
  readonly route = input.required<string>();

  /** Optional icon to display */
  readonly icon = input<IconName | undefined>(undefined);

  /** Optional indicator color (used for environment indicators) */
  readonly indicatorColor = input<string | undefined>(undefined);

  /** Whether this nav item is currently active */
  readonly active = input<boolean>(false);

  /** Computed CSS classes for the list item */
  protected readonly itemClasses = computed(() => ({
    'nav-item': true,
    'nav-item--active': this.active(),
  }));

  /** Whether to show icon (only when no indicator color) */
  protected readonly showIcon = computed(() => this.icon() && !this.indicatorColor());

  /** Whether to show indicator (takes precedence over icon) */
  protected readonly showIndicator = computed(() => !!this.indicatorColor());
}
