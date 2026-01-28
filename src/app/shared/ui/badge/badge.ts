import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'created'
  | 'updated'
  | 'deleted'
  | 'toggled';

export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('info');
  readonly size = input<BadgeSize>('md');
  readonly dismissible = input(false);

  readonly dismissed = output<void>();

  protected readonly hostClasses = computed(() => {
    const classes = ['badge', `badge--${this.variant()}`];

    if (this.size() !== 'md') {
      classes.push(`badge--${this.size()}`);
    }

    if (this.dismissible()) {
      classes.push('badge--dismissible');
    }

    return classes.join(' ');
  });

  protected onDismiss(): void {
    this.dismissed.emit();
  }
}
