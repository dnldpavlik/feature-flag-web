import { Injectable, computed, signal } from '@angular/core';

import { CreateFlagInput, Flag } from '../models/flag.model';

const nowStamp = () => new Date().toISOString();
const createId = () => `flag_${Math.random().toString(36).slice(2, 10)}`;

@Injectable({ providedIn: 'root' })
export class FlagStore {
  private readonly _flags = signal<Flag[]>([
    {
      id: 'flag_new_checkout',
      key: 'new-checkout',
      name: 'New Checkout Experience',
      description: 'Roll out the updated checkout flow by cohort.',
      type: 'boolean',
      enabled: true,
      tags: ['checkout', 'web'],
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
    },
    {
      id: 'flag_pricing_banner',
      key: 'pricing-banner',
      name: 'Pricing Banner',
      description: 'Show the new pricing CTA on marketing pages.',
      type: 'boolean',
      enabled: false,
      tags: ['marketing'],
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
    },
    {
      id: 'flag_beta_theme',
      key: 'beta-theme',
      name: 'Beta Theme Palette',
      description: 'Preview the new theme tokens in select orgs.',
      type: 'string',
      enabled: true,
      tags: ['design', 'beta'],
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
    },
    {
      id: 'flag_search_boost',
      key: 'search-boost',
      name: 'Search Boost Weighting',
      description: 'Tune search relevance weighting for enterprise.',
      type: 'number',
      enabled: false,
      tags: ['search', 'enterprise'],
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
    },
    {
      id: 'flag_checkout_guardrails',
      key: 'checkout-guardrails',
      name: 'Checkout Guardrails',
      description: 'Ship guardrail config for risky payment methods.',
      type: 'json',
      enabled: true,
      tags: ['risk', 'payments'],
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
    },
  ]);

  readonly flags = this._flags.asReadonly();
  readonly totalCount = computed(() => this._flags().length);

  addFlag(input: CreateFlagInput): void {
    const stamp = nowStamp();
    const newFlag: Flag = {
      id: createId(),
      key: input.key,
      name: input.name,
      description: input.description,
      type: input.type,
      enabled: input.enabled,
      tags: input.tags,
      createdAt: stamp,
      updatedAt: stamp,
    };

    this._flags.update((flags) => [newFlag, ...flags]);
  }
}
