import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonComponent } from '@/app/shared/ui/button/button';
import { CreateFlagInput, FlagType } from '../../models/flag.model';
import { FlagTypeMap } from '../../models/flag-value.model';
import { getDefaultForType } from '../../utils/flag-value.utils';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { FlagStore } from '../../store/flag.store';

@Component({
  selector: 'app-flag-create',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './flag-create.html',
  styleUrl: './flag-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagCreateComponent {
  private readonly store = inject(FlagStore);
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    key: [''],
    description: [''],
    type: this.fb.control<FlagType>('boolean'),
    tags: [''],
    booleanValue: [false],
    stringValue: [''],
    numberValue: [0],
    jsonValue: ['{}'],
  });

  protected readonly jsonError = signal<string | null>(null);

  // Per-environment enabled state
  protected readonly environments = this.environmentStore.sortedEnvironments;
  private readonly _enabledEnvironments = signal<Record<string, boolean>>({});

  protected readonly environmentsWithEnabled = computed(() => {
    const enabled = this._enabledEnvironments();
    return this.environments().map((env) => ({
      ...env,
      enabled: enabled[env.id] ?? false,
    }));
  });

  protected toggleEnvironment(envId: string, enabled: boolean): void {
    this._enabledEnvironments.update((current) => ({
      ...current,
      [envId]: enabled,
    }));
  }

  protected onEnvironmentToggle(envId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleEnvironment(envId, checked);
  }

  protected onTypeChange(newType: FlagType): void {
    this.form.controls.type.setValue(newType);
  }

  protected createFlag(): void {
    const { name, key, description, tags } = this.form.getRawValue();
    const trimmedName = name.trim();
    const resolvedKey = key.trim() || this.toKey(trimmedName);
    const resolvedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (!trimmedName || !resolvedKey) {
      return;
    }

    const defaultValue = this.getDefaultValue();
    if (defaultValue === null) {
      return; // Invalid JSON
    }

    const input = this.buildCreateInput(
      resolvedKey,
      trimmedName,
      description.trim(),
      resolvedTags,
      defaultValue
    );

    this.store.addFlag(input, this._enabledEnvironments());
    void this.router.navigate(['/flags']);
  }

  protected cancel(): void {
    void this.router.navigate(['/flags']);
  }

  protected validateJson(): void {
    const jsonValue = this.form.controls.jsonValue.value;
    try {
      const parsed = JSON.parse(jsonValue);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        this.jsonError.set('JSON must be an object');
      } else {
        this.jsonError.set(null);
      }
    } catch {
      this.jsonError.set('Invalid JSON syntax');
    }
  }

  private getDefaultValue(): FlagTypeMap[FlagType] | null {
    const { type, booleanValue, stringValue, numberValue, jsonValue } = this.form.getRawValue();
    switch (type) {
      case 'boolean':
        return booleanValue;
      case 'string':
        return stringValue;
      case 'number':
        return numberValue;
      case 'json':
        try {
          const parsed = JSON.parse(jsonValue);
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            this.jsonError.set('JSON must be an object');
            return null;
          }
          return parsed;
        } catch {
          this.jsonError.set('Invalid JSON syntax');
          return null;
        }
      default:
        return getDefaultForType(type);
    }
  }

  private buildCreateInput(
    key: string,
    name: string,
    description: string,
    tags: string[],
    defaultValue: FlagTypeMap[FlagType]
  ): CreateFlagInput {
    const currentType = this.form.controls.type.value;
    switch (currentType) {
      case 'boolean':
        return { key, name, description, tags, type: 'boolean', defaultValue: defaultValue as boolean };
      case 'string':
        return { key, name, description, tags, type: 'string', defaultValue: defaultValue as string };
      case 'number':
        return { key, name, description, tags, type: 'number', defaultValue: defaultValue as number };
      case 'json':
        return { key, name, description, tags, type: 'json', defaultValue: defaultValue as Record<string, unknown> };
    }
  }

  private toKey(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
