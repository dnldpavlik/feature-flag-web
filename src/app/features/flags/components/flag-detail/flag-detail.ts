import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { Flag, FlagType } from '../../models/flag.model';
import { FlagTypeMap } from '../../models/flag-value.model';
import { EnvironmentStore } from '../../store/environment.store';
import { FlagStore } from '../../store/flag.store';

interface FlagEnvironmentRow {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  value: FlagTypeMap[FlagType];
}

@Component({
  selector: 'app-flag-detail',
  standalone: true,
  imports: [ButtonComponent, EmptyStateComponent, FormsModule],
  templateUrl: './flag-detail.html',
  styleUrl: './flag-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagDetailComponent {
  private readonly store = inject(FlagStore);
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly flagId = signal(this.route.snapshot.paramMap.get('flagId') ?? '');
  protected readonly flag = computed(() => this.store.getFlagById(this.flagId()));
  protected readonly environments = this.environmentStore.sortedEnvironments;

  protected name = '';
  protected description = '';
  protected tags = '';

  protected booleanValue = false;
  protected stringValue = '';
  protected numberValue = 0;
  protected jsonValue = '{}';
  protected jsonError = signal<string | null>(null);

  private readonly initialized = signal(false);

  protected readonly environmentRows = computed<FlagEnvironmentRow[]>(() => {
    const flag = this.flag();
    if (!flag) return [];

    return this.environments().map((env) => {
      const envValue = flag.environmentValues[env.id];
      return {
        id: env.id,
        name: env.name,
        color: env.color,
        enabled: envValue?.enabled ?? false,
        value: (envValue?.value ?? flag.defaultValue) as FlagTypeMap[FlagType],
      };
    });
  });

  constructor() {
    effect(() => {
      const current = this.flag();
      if (!current || this.initialized()) {
        return;
      }

      this.name = current.name;
      this.description = current.description;
      this.tags = current.tags.join(', ');
      this.setDefaultValueFields(current);
      this.initialized.set(true);
    });
  }

  protected saveDetails(): void {
    const current = this.flag();
    if (!current) return;

    const resolvedTags = this.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const defaultValue = this.resolveDefaultValue(current.type);
    if (defaultValue === null) {
      return;
    }

    this.store.updateFlagDetails(current.id, {
      name: this.name.trim() || current.name,
      description: this.description.trim(),
      tags: resolvedTags,
      defaultValue,
    });
  }

  protected toggleEnvironment(envId: string, enabled: boolean): void {
    const current = this.flag();
    if (!current) return;
    this.store.toggleFlagInEnvironment(current.id, envId, enabled);
  }

  protected updateEnvironmentValue(envId: string, value: string): void {
    const current = this.flag();
    if (!current) return;

    const parsed = this.parseValue(current.type, value);
    if (parsed === null) {
      return;
    }

    this.store.updateEnvironmentValue({
      flagId: current.id,
      environmentId: envId,
      value: parsed,
    });
  }

  protected backToList(): void {
    void this.router.navigate(['/flags']);
  }

  private setDefaultValueFields(flag: Flag): void {
    switch (flag.type) {
      case 'boolean':
        this.booleanValue = Boolean(flag.defaultValue);
        break;
      case 'string':
        this.stringValue = String(flag.defaultValue ?? '');
        break;
      case 'number':
        this.numberValue = Number(flag.defaultValue ?? 0);
        break;
      case 'json':
        this.jsonValue = JSON.stringify(flag.defaultValue ?? {}, null, 2);
        break;
    }
  }

  private resolveDefaultValue(type: FlagType): FlagTypeMap[FlagType] | null {
    switch (type) {
      case 'boolean':
        return this.booleanValue;
      case 'string':
        return this.stringValue;
      case 'number':
        return this.numberValue;
      case 'json':
        try {
          const parsed = JSON.parse(this.jsonValue);
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            this.jsonError.set('JSON must be an object');
            return null;
          }
          this.jsonError.set(null);
          return parsed as FlagTypeMap[FlagType];
        } catch {
          this.jsonError.set('Invalid JSON syntax');
          return null;
        }
    }
  }

  private parseValue(type: FlagType, rawValue: string): FlagTypeMap[FlagType] | null {
    switch (type) {
      case 'boolean':
        return rawValue === 'true';
      case 'string':
        return rawValue;
      case 'number': {
        const parsed = Number(rawValue);
        return Number.isNaN(parsed) ? null : parsed;
      }
      case 'json':
        try {
          return JSON.parse(rawValue) as FlagTypeMap[FlagType];
        } catch {
          return null;
        }
    }
  }

  protected formatJsonValue(value: unknown): string {
    return JSON.stringify(value);
  }
}
