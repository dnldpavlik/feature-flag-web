import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { IconComponent } from '@watt/ui';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info';
export type AuditBadgeVariant = 'created' | 'updated' | 'deleted' | 'toggled';
export type ExtendedBadgeVariant = BadgeVariant | AuditBadgeVariant;

@Component({
  selector: 'app-audit-badge',
  imports: [IconComponent],
  templateUrl: './audit-badge.html',
  styleUrl: './audit-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class AuditBadgeComponent {
  readonly variant = input<ExtendedBadgeVariant>('info');
  readonly dismissible = input(false);

  readonly dismissed = output<void>();

  protected readonly hostClasses = computed(() => `badge badge--${this.variant()}`);

  protected onDismiss(): void {
    this.dismissed.emit();
  }
}
