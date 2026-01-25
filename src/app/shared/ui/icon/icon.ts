import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ICON_CLIP_RULES, ICON_FILL_RULES, ICON_PATHS } from './icon.data';
import { IconName } from './icon.types';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'icon',
  },
})
export class IconComponent {
  /** The name of the icon to display */
  readonly name = input.required<IconName>();

  /** The size of the icon in pixels (width and height) */
  readonly size = input<number | string>(20);

  /** Computed viewBox based on size - icons are designed for 16 or 20 viewBox */
  protected readonly viewBox = computed(() => {
    const name = this.name();
    // chevron-right and plus use 16x16 viewBox, others use 20x20
    return name === 'chevron-right' || name === 'plus' || name === 'search'
      ? '0 0 16 16'
      : '0 0 20 20';
  });

  /** Get the SVG path for the current icon */
  protected readonly path = computed(() => ICON_PATHS[this.name()]);

  /** Get the fill-rule if needed */
  protected readonly fillRule = computed(() => ICON_FILL_RULES[this.name()]);

  /** Get the clip-rule if needed */
  protected readonly clipRule = computed(() => ICON_CLIP_RULES[this.name()]);
}
