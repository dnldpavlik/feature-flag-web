import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonComponent } from '@/app/shared/ui/button/button';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { Flag, FlagType } from '@/app/features/flags/models/flag.model';
import { FlagTypeMap } from '@/app/features/flags/models/flag-value.model';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { parseValueForType, validateJsonObject } from '@/app/features/flags/utils/flag-format.utils';
import { FlagEnvironmentRow } from './flag-detail.types';

@Component({
  selector: 'app-flag-detail',
  imports: [ButtonComponent, EmptyStateComponent, ReactiveFormsModule],
  templateUrl: './flag-detail.html',
  styleUrl: './flag-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagDetailComponent {
  private readonly store = inject(FlagStore);
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly flagId = signal(this.route.snapshot.paramMap.get('flagId') ?? '');
  protected readonly flag = computed(() => this.store.getFlagById(this.flagId()));
  protected readonly environments = this.environmentStore.sortedEnvironments;

  protected readonly form = this.fb.group({
    name: [''],
    description: [''],
    tags: [''],
    booleanValue: [false],
    stringValue: [''],
    numberValue: [0],
    jsonValue: ['{}'],
  });

  protected readonly jsonError = signal<string | null>(null);

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

  // Getter/setters for backward compatibility with tests
  get name(): string {
    return this.form.controls.name.value;
  }
  set name(value: string) {
    this.form.controls.name.setValue(value);
  }

  get description(): string {
    return this.form.controls.description.value;
  }
  set description(value: string) {
    this.form.controls.description.setValue(value);
  }

  get tags(): string {
    return this.form.controls.tags.value;
  }
  set tags(value: string) {
    this.form.controls.tags.setValue(value);
  }

  get booleanValue(): boolean {
    return this.form.controls.booleanValue.value;
  }
  set booleanValue(value: boolean) {
    this.form.controls.booleanValue.setValue(value);
  }

  get stringValue(): string {
    return this.form.controls.stringValue.value;
  }
  set stringValue(value: string) {
    this.form.controls.stringValue.setValue(value);
  }

  get numberValue(): number {
    return this.form.controls.numberValue.value;
  }
  set numberValue(value: number) {
    this.form.controls.numberValue.setValue(value);
  }

  get jsonValue(): string {
    return this.form.controls.jsonValue.value;
  }
  set jsonValue(value: string) {
    this.form.controls.jsonValue.setValue(value);
  }

  constructor() {
    effect(() => {
      const current = this.flag();
      if (!current || this.initialized()) {
        return;
      }

      this.form.patchValue({
        name: current.name,
        description: current.description,
        tags: current.tags.join(', '),
      });
      this.setDefaultValueFields(current);
      this.initialized.set(true);
    });
  }

  protected saveDetails(): void {
    const current = this.flag();
    if (!current) return;

    const { name, description, tags } = this.form.getRawValue();
    const resolvedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const defaultValue = this.resolveDefaultValue(current.type);
    if (defaultValue === null) {
      return;
    }

    this.store.updateFlagDetails(current.id, {
      name: name.trim() || current.name,
      description: description.trim(),
      tags: resolvedTags,
      defaultValue,
    });
  }

  protected toggleEnvironment(envId: string, enabled: boolean): void {
    const current = this.flag();
    if (!current) return;
    this.store.toggleFlagInEnvironment(current.id, envId, enabled);
  }

  protected onEnvironmentToggle(envId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleEnvironment(envId, checked);
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

  protected onEnvironmentValueChange(envId: string, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
      .value;
    this.updateEnvironmentValue(envId, value);
  }

  protected backToList(): void {
    void this.router.navigate(['/flags']);
  }

  protected cancelChanges(): void {
    const current = this.flag();
    if (current) {
      this.form.patchValue({
        name: current.name,
        description: current.description,
        tags: current.tags.join(', '),
      });
      this.setDefaultValueFields(current);
      this.jsonError.set(null);
    }
    this.location.back();
  }

  private setDefaultValueFields(flag: Flag): void {
    switch (flag.type) {
      case 'boolean':
        this.form.controls.booleanValue.setValue(Boolean(flag.defaultValue));
        break;
      case 'string':
        this.form.controls.stringValue.setValue(String(flag.defaultValue ?? ''));
        break;
      case 'number':
        this.form.controls.numberValue.setValue(Number(flag.defaultValue ?? 0));
        break;
      case 'json':
        this.form.controls.jsonValue.setValue(JSON.stringify(flag.defaultValue ?? {}, null, 2));
        break;
    }
  }

  private resolveDefaultValue(type: FlagType): FlagTypeMap[FlagType] | null {
    const { booleanValue, stringValue, numberValue, jsonValue } = this.form.getRawValue();
    switch (type) {
      case 'boolean':
        return booleanValue;
      case 'string':
        return stringValue;
      case 'number':
        return numberValue;
      case 'json': {
        const result = validateJsonObject(jsonValue);
        if (!result.valid) {
          this.jsonError.set(result.error!);
          return null;
        }
        this.jsonError.set(null);
        return result.value as FlagTypeMap[FlagType];
      }
    }
  }

  private parseValue(type: FlagType, rawValue: string): FlagTypeMap[FlagType] | null {
    return parseValueForType(type, rawValue);
  }

  protected formatJsonValue(value: unknown): string {
    return JSON.stringify(value);
  }
}
