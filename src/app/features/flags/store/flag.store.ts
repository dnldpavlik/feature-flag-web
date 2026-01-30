import { Injectable, computed, inject, signal } from '@angular/core';

import { TimeService } from '@/app/core/time/time.service';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { createId } from '@/app/shared/utils/id.utils';
import {
  CreateFlagInput,
  Flag,
  FlagType,
  UpdateEnvironmentValueInput,
} from '@/app/features/flags/models/flag.model';
import { EnvironmentFlagValue, FlagTypeMap } from '@/app/features/flags/models/flag-value.model';
import {
  getEffectiveValue,
  isEnabledInEnvironment,
} from '@/app/features/flags/utils/flag-value.utils';

/** Fixed timestamp for seed data */
const SEED_TIMESTAMP = '2025-01-01T00:00:00.000Z';

/** Creates seed environment value with fixed timestamps */
function createSeedEnvValue<T>(
  flagId: string,
  environmentId: string,
  value: T,
  enabled: boolean,
): EnvironmentFlagValue {
  return {
    flagId,
    environmentId,
    value: value as FlagTypeMap[FlagType],
    enabled,
    updatedAt: SEED_TIMESTAMP,
  };
}

@Injectable({ providedIn: 'root' })
export class FlagStore {
  private readonly timeService = inject(TimeService);
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly projectStore = inject(ProjectStore);

  private readonly _flags = signal<Flag[]>([
    {
      id: 'flag_new_checkout',
      projectId: 'proj_default',
      key: 'new-checkout',
      name: 'New Checkout Experience',
      description: 'Roll out the updated checkout flow by cohort.',
      type: 'boolean',
      defaultValue: false,
      tags: ['checkout', 'web'],
      environmentValues: {
        env_development: createSeedEnvValue('flag_new_checkout', 'env_development', true, true),
        env_staging: createSeedEnvValue('flag_new_checkout', 'env_staging', true, true),
        env_production: createSeedEnvValue('flag_new_checkout', 'env_production', false, false),
      },
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
    {
      id: 'flag_pricing_banner',
      projectId: 'proj_default',
      key: 'pricing-banner',
      name: 'Pricing Banner',
      description: 'Show the new pricing CTA on marketing pages.',
      type: 'boolean',
      defaultValue: false,
      tags: ['marketing'],
      environmentValues: {
        env_development: createSeedEnvValue('flag_pricing_banner', 'env_development', true, true),
        env_staging: createSeedEnvValue('flag_pricing_banner', 'env_staging', false, false),
        env_production: createSeedEnvValue('flag_pricing_banner', 'env_production', false, false),
      },
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
    {
      id: 'flag_beta_theme',
      projectId: 'proj_default',
      key: 'beta-theme',
      name: 'Beta Theme Palette',
      description: 'Preview the new theme tokens in select orgs.',
      type: 'string',
      defaultValue: 'default',
      tags: ['design', 'beta'],
      environmentValues: {
        env_development: createSeedEnvValue('flag_beta_theme', 'env_development', 'dark', true),
        env_staging: createSeedEnvValue('flag_beta_theme', 'env_staging', 'light', true),
        env_production: createSeedEnvValue('flag_beta_theme', 'env_production', 'default', false),
      },
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
    {
      id: 'flag_search_boost',
      projectId: 'proj_growth',
      key: 'search-boost',
      name: 'Search Boost Weighting',
      description: 'Tune search relevance weighting for enterprise.',
      type: 'number',
      defaultValue: 1.0,
      tags: ['search', 'enterprise'],
      environmentValues: {
        env_development: createSeedEnvValue('flag_search_boost', 'env_development', 1.5, true),
        env_staging: createSeedEnvValue('flag_search_boost', 'env_staging', 1.2, false),
        env_production: createSeedEnvValue('flag_search_boost', 'env_production', 1.0, false),
      },
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
    {
      id: 'flag_checkout_guardrails',
      projectId: 'proj_growth',
      key: 'checkout-guardrails',
      name: 'Checkout Guardrails',
      description: 'Ship guardrail config for risky payment methods.',
      type: 'json',
      defaultValue: { maxAmount: 1000, requireVerification: false },
      tags: ['risk', 'payments'],
      environmentValues: {
        env_development: createSeedEnvValue(
          'flag_checkout_guardrails',
          'env_development',
          { maxAmount: 10000, requireVerification: false },
          true,
        ),
        env_staging: createSeedEnvValue(
          'flag_checkout_guardrails',
          'env_staging',
          { maxAmount: 5000, requireVerification: true },
          true,
        ),
        env_production: createSeedEnvValue(
          'flag_checkout_guardrails',
          'env_production',
          { maxAmount: 1000, requireVerification: true },
          true,
        ),
      },
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
  ]);

  readonly flags = this._flags.asReadonly();
  readonly totalCount = computed(() => this._flags().length);

  readonly currentEnvironmentId = computed(() => this.environmentStore.selectedEnvironmentId());

  readonly flagsInSelectedProject = computed(() => {
    const projectId = this.projectStore.selectedProjectId();
    return this._flags().filter((flag) => flag.projectId === projectId);
  });

  readonly enabledFlagsInCurrentEnvironment = computed(() =>
    this.flagsInSelectedProject().filter((flag) =>
      isEnabledInEnvironment(flag, this.currentEnvironmentId()),
    ),
  );

  addFlag(input: CreateFlagInput, initialEnabledEnvironments?: Record<string, boolean>): void {
    const stamp = this.timeService.now();
    const flagId = createId('flag');
    const environments = this.environmentStore.environments();

    const environmentValues: Record<string, EnvironmentFlagValue> = {};
    for (const env of environments) {
      environmentValues[env.id] = {
        environmentId: env.id,
        flagId,
        value: input.defaultValue,
        enabled: initialEnabledEnvironments?.[env.id] ?? false,
        updatedAt: stamp,
      };
    }

    const newFlag: Flag = {
      id: flagId,
      projectId: input.projectId,
      key: input.key,
      name: input.name,
      description: input.description,
      type: input.type,
      defaultValue: input.defaultValue,
      tags: input.tags,
      environmentValues,
      createdAt: stamp,
      updatedAt: stamp,
    };

    this._flags.update((flags) => [newFlag, ...flags]);
  }

  deleteFlag(flagId: string): void {
    if (this._flags().length <= 1) return;
    this._flags.update((flags) => flags.filter((flag) => flag.id !== flagId));
  }

  getFlagById(id: string): Flag | undefined {
    return this._flags().find((f) => f.id === id);
  }

  updateFlagDetails(
    flagId: string,
    updates: Partial<Pick<Flag, 'name' | 'description' | 'tags' | 'defaultValue'>>,
  ): void {
    const stamp = this.timeService.now();

    this._flags.update((flags) =>
      flags.map((flag) => {
        if (flag.id !== flagId) return flag;
        return {
          ...flag,
          ...updates,
          updatedAt: stamp,
        };
      }),
    );
  }

  updateEnvironmentValue(input: UpdateEnvironmentValueInput): void {
    this._flags.update((flags) =>
      flags.map((flag) => {
        if (flag.id !== input.flagId) return flag;

        const stamp = this.timeService.now();
        const existingEnvValue = flag.environmentValues[input.environmentId];

        return {
          ...flag,
          environmentValues: {
            ...flag.environmentValues,
            [input.environmentId]: {
              environmentId: input.environmentId,
              flagId: flag.id,
              value: input.value ?? existingEnvValue?.value ?? flag.defaultValue,
              enabled: input.enabled ?? existingEnvValue?.enabled ?? false,
              updatedAt: stamp,
            },
          },
          updatedAt: stamp,
        };
      }),
    );
  }

  toggleFlagInEnvironment(flagId: string, environmentId: string, enabled: boolean): void {
    this._flags.update((flags) =>
      flags.map((flag) => {
        if (flag.id !== flagId) return flag;

        const stamp = this.timeService.now();
        const existingEnvValue = flag.environmentValues[environmentId];

        return {
          ...flag,
          environmentValues: {
            ...flag.environmentValues,
            [environmentId]: {
              environmentId,
              flagId,
              value: existingEnvValue?.value ?? flag.defaultValue,
              enabled,
              updatedAt: stamp,
            },
          },
          updatedAt: stamp,
        };
      }),
    );
  }

  getValueInEnvironment<T extends FlagType>(
    flagId: string,
    environmentId: string,
  ): FlagTypeMap[T] | undefined {
    const flag = this.getFlagById(flagId);
    if (!flag) return undefined;
    return getEffectiveValue<T>(flag, environmentId);
  }
}
