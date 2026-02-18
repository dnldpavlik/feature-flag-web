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

import {
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  FormFieldComponent,
  ToggleComponent,
} from '@watt/ui';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { Flag, FlagType } from '@/app/features/flags/models/flag.model';
import { FlagTypeMap } from '@/app/features/flags/models/flag-value.model';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { parseValueForType } from '@/app/features/flags/utils/flag-format.utils';
import { extractDefaultValue, parseTags } from '@/app/features/flags/utils/flag-form.utils';
import { FlagValueInputComponent } from '../flag-value-input/flag-value-input';
import { FlagEnvironmentRow } from './flag-detail.types';

@Component({
  selector: 'app-flag-detail',
  imports: [
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    FlagValueInputComponent,
    FormFieldComponent,
    ReactiveFormsModule,
    ToggleComponent,
  ],
  templateUrl: './flag-detail.html',
  styleUrl: './flag-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagDetailComponent {
  private readonly store = inject(FlagStore);
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly flagId = signal(this.route.snapshot.paramMap.get('flagId') ?? '');
  private readonly rawFlag = computed(() => this.store.getFlagById(this.flagId()));

  // Only return flag if it belongs to the selected project
  protected readonly flag = computed(() => {
    const flag = this.rawFlag();
    if (!flag) {
      return undefined;
    }
    return flag.projectId === this.projectStore.selectedProjectId() ? flag : undefined;
  });

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

  protected readonly canDelete = computed(() => this.store.flags().length > 1);

  protected readonly environmentRows = computed<FlagEnvironmentRow[]>(() => {
    const flag = this.flag();
    if (!flag) {
      return [];
    }

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

      this.form.patchValue({
        name: current.name,
        description: current.description,
        tags: current.tags.join(', '),
      });
      this.setDefaultValueFields(current);
      this.initialized.set(true);
    });
  }

  protected async saveDetails(): Promise<void> {
    const current = this.flag();
    if (!current) {
      return;
    }

    const formData = this.form.getRawValue();
    const result = extractDefaultValue(current.type, formData);
    if (!result.success) {
      this.jsonError.set(result.error);
      return;
    }
    this.jsonError.set(null);

    await this.store.updateFlagDetails(current.id, {
      name: formData.name.trim() || current.name,
      description: formData.description.trim(),
      tags: parseTags(formData.tags),
      defaultValue: result.value,
    });
  }

  protected toggleEnvironment(envId: string, enabled: boolean): void {
    const current = this.flag();
    if (!current) {
      return;
    }
    this.store.toggleFlagInEnvironment(current.id, envId, enabled);
  }

  protected onEnvironmentToggle(envId: string, checked: boolean): void {
    this.toggleEnvironment(envId, checked);
  }

  protected updateEnvironmentValue(envId: string, value: string): void {
    const current = this.flag();
    if (!current) {
      return;
    }

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

  // Delete confirmation state
  protected readonly showDeleteConfirm = signal(false);

  protected requestDeleteFlag(): void {
    this.showDeleteConfirm.set(true);
  }

  protected cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  protected async confirmDelete(): Promise<void> {
    const current = this.flag();
    if (!current) {
      return;
    }
    await this.store.deleteFlag(current.id);
    this.showDeleteConfirm.set(false);
    void this.router.navigate(['/flags']);
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

  private parseValue(type: FlagType, rawValue: string): FlagTypeMap[FlagType] | null {
    return parseValueForType(type, rawValue);
  }

  protected formatJsonValue(value: unknown): string {
    return JSON.stringify(value);
  }
}
