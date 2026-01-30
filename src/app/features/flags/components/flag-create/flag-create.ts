import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonComponent } from '@/app/shared/ui/button/button';
import { FormFieldComponent } from '@/app/shared/ui/form-field/form-field';
import { SelectFieldComponent, SelectOption } from '@/app/shared/ui/select-field';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { toKey } from '@/app/shared/utils/url.utils';
import { FlagType } from '@/app/features/flags/models/flag.model';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { FlagValueInputComponent } from '../flag-value-input/flag-value-input';
import {
  extractDefaultValue,
  buildCreateFlagInput,
  parseTags,
} from '@/app/features/flags/utils/flag-form.utils';
import { validateJsonObject } from '@/app/features/flags/utils/flag-format.utils';

@Component({
  selector: 'app-flag-create',
  imports: [
    ButtonComponent,
    FlagValueInputComponent,
    FormFieldComponent,
    ReactiveFormsModule,
    SelectFieldComponent,
  ],
  templateUrl: './flag-create.html',
  styleUrl: './flag-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagCreateComponent {
  protected readonly typeOptions: SelectOption[] = [
    { value: 'boolean', label: 'Boolean' },
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'json', label: 'JSON' },
  ];
  private readonly store = inject(FlagStore);
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly projectStore = inject(ProjectStore);
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

  protected onEnvironmentToggle(envId: string, checked: boolean): void {
    this.toggleEnvironment(envId, checked);
  }

  protected onTypeChange(newType: FlagType): void {
    this.form.controls.type.setValue(newType);
  }

  protected createFlag(): void {
    const formData = this.form.getRawValue();
    const trimmedName = formData.name.trim();
    const resolvedKey = formData.key.trim() || toKey(trimmedName);

    if (!trimmedName || !resolvedKey) {
      return;
    }

    const result = extractDefaultValue(formData.type, formData);
    if (!result.success) {
      this.jsonError.set(result.error);
      return;
    }

    const input = buildCreateFlagInput({
      projectId: this.projectStore.selectedProjectId(),
      type: formData.type,
      key: resolvedKey,
      name: trimmedName,
      description: formData.description.trim(),
      tags: parseTags(formData.tags),
      defaultValue: result.value,
    });

    this.store.addFlag(input, this._enabledEnvironments());
    void this.router.navigate(['/flags']);
  }

  protected cancel(): void {
    void this.router.navigate(['/flags']);
  }

  protected validateJson(): void {
    const jsonValue = this.form.controls.jsonValue.value;
    const result = validateJsonObject(jsonValue);
    this.jsonError.set(result.valid ? null : result.error!);
  }
}
