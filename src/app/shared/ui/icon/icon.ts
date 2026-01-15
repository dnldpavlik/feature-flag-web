import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

/** Icon name type for type safety */
export type IconName =
  | 'menu'
  | 'chevron-right'
  | 'search'
  | 'plus'
  | 'home'
  | 'flag'
  | 'folder'
  | 'users'
  | 'list'
  | 'settings';

/** SVG path data for each icon */
const ICON_PATHS: Record<IconName, string> = {
  'menu': 'M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z',
  'chevron-right': 'M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z',
  'search': 'M11.5 7a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-.82 4.74a6 6 0 111.06-1.06l2.79 2.79a.75.75 0 11-1.06 1.06l-2.79-2.79z',
  'plus': 'M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z',
  'home': 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z',
  'flag': 'M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z',
  'folder': 'M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z',
  'users': 'M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z',
  'list': 'M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z',
  'settings': 'M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z'
};

/** Icon fill rules for icons that need them */
const ICON_FILL_RULES: Partial<Record<IconName, 'evenodd' | 'nonzero'>> = {
  'menu': 'evenodd',
  'search': 'evenodd',
  'flag': 'evenodd',
  'list': 'evenodd',
  'settings': 'evenodd'
};

/** Icon clip rules for icons that need them */
const ICON_CLIP_RULES: Partial<Record<IconName, 'evenodd' | 'nonzero'>> = {
  'menu': 'evenodd',
  'search': 'evenodd',
  'flag': 'evenodd',
  'list': 'evenodd',
  'settings': 'evenodd'
};

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'icon'
  }
})
export class Icon {
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
