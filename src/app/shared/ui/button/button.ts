import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IconComponent, IconName } from '../icon/icon';

/** Button variant types */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/** Button size types */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Button type attribute */
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  imports: [IconComponent],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  /** The visual style variant of the button */
  readonly variant = input<ButtonVariant>('primary');

  /** The size of the button */
  readonly size = input<ButtonSize>('md');

  /** The HTML button type attribute */
  readonly type = input<ButtonType>('button');

  /** Whether the button is disabled */
  readonly disabled = input<boolean>(false);

  /** Whether the button is in a loading state */
  readonly loading = input<boolean>(false);

  /** Optional icon to display before the button text */
  readonly icon = input<IconName | undefined>(undefined);

  /** Size of the icon in pixels */
  readonly iconSize = input<number>(16);

  /** Computed disabled state - disabled when explicitly disabled or loading */
  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  /** Computed CSS classes for the button */
  protected readonly buttonClasses = computed(() => ({
    btn: true,
    [`btn--${this.variant()}`]: true,
    [`btn--${this.size()}`]: true,
    'btn--loading': this.loading(),
  }));
}
