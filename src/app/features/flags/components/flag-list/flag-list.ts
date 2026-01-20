import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';

type FlagType = 'boolean' | 'string' | 'number' | 'json';
type StatusFilter = 'all' | 'enabled' | 'disabled';
type TypeFilter = 'all' | FlagType;

interface FlagSummary {
  key: string;
  name: string;
  description: string;
  type: FlagType;
  enabled: boolean;
  tags: string[];
  updatedAt: string;
}

@Component({
  selector: 'app-flag-list',
  standalone: true,
  imports: [ButtonComponent, EmptyStateComponent],
  templateUrl: './flag-list.html',
  styleUrl: './flag-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagListComponent {
  private readonly flags = signal<FlagSummary[]>([
    {
      key: 'new-checkout',
      name: 'New Checkout Experience',
      description: 'Roll out the updated checkout flow by cohort.',
      type: 'boolean',
      enabled: true,
      tags: ['checkout', 'web'],
      updatedAt: '2 hours ago',
    },
    {
      key: 'pricing-banner',
      name: 'Pricing Banner',
      description: 'Show the new pricing CTA on marketing pages.',
      type: 'boolean',
      enabled: false,
      tags: ['marketing'],
      updatedAt: 'Yesterday',
    },
    {
      key: 'beta-theme',
      name: 'Beta Theme Palette',
      description: 'Preview the new theme tokens in select orgs.',
      type: 'string',
      enabled: true,
      tags: ['design', 'beta'],
      updatedAt: '3 days ago',
    },
    {
      key: 'search-boost',
      name: 'Search Boost Weighting',
      description: 'Tune search relevance weighting for enterprise.',
      type: 'number',
      enabled: false,
      tags: ['search', 'enterprise'],
      updatedAt: 'Last week',
    },
    {
      key: 'checkout-guardrails',
      name: 'Checkout Guardrails',
      description: 'Ship guardrail config for risky payment methods.',
      type: 'json',
      enabled: true,
      tags: ['risk', 'payments'],
      updatedAt: 'Last week',
    },
  ]);

  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly typeFilter = signal<TypeFilter>('all');

  protected readonly filteredFlags = computed(() => {
    const status = this.statusFilter();
    const type = this.typeFilter();

    return this.flags().filter((flag) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'enabled' && flag.enabled) ||
        (status === 'disabled' && !flag.enabled);
      const matchesType = type === 'all' || flag.type === type;
      return matchesStatus && matchesType;
    });
  });

  protected readonly filteredCount = computed(() => this.filteredFlags().length);
  protected readonly totalCount = computed(() => this.flags().length);

  protected onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as StatusFilter;
    this.statusFilter.set(value);
  }

  protected onTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as TypeFilter;
    this.typeFilter.set(value);
  }
}
