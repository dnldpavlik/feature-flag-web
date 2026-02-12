import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { LabeledSelectComponent, SelectOption } from '@watt/ui';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { PreferencesStore } from '../../store/preferences.store';
import { EmailDigestFrequency } from '../../models/settings.model';

@Component({
  selector: 'app-preferences-tab',
  imports: [LabeledSelectComponent],
  templateUrl: './preferences-tab.html',
  styleUrl: './preferences-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesTabComponent {
  private readonly preferencesStore = inject(PreferencesStore);
  private readonly environmentStore = inject(EnvironmentStore);

  protected readonly projectPreferences = computed(() =>
    this.preferencesStore.projectPreferences(),
  );

  protected readonly environmentOptions = computed((): SelectOption[] =>
    this.environmentStore.environments().map((env) => ({
      value: env.id,
      label: env.name,
    })),
  );

  protected readonly currentDefaultEnvId = computed(
    () => this.projectPreferences().defaultEnvironmentId,
  );

  protected readonly notifications = computed(() => this.projectPreferences().notifications);

  protected onDefaultEnvironmentChange(value: string): void {
    this.preferencesStore.updateProjectPreferences({
      defaultEnvironmentId: value,
    });
  }

  protected onEmailOnFlagChangeToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.preferencesStore.updateProjectPreferences({
      notifications: {
        ...this.notifications(),
        emailOnFlagChange: checked,
      },
    });
  }

  protected onEmailOnApiKeyCreatedToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.preferencesStore.updateProjectPreferences({
      notifications: {
        ...this.notifications(),
        emailOnApiKeyCreated: checked,
      },
    });
  }

  protected onEmailDigestChange(frequency: EmailDigestFrequency): void {
    this.preferencesStore.updateProjectPreferences({
      notifications: {
        ...this.notifications(),
        emailDigest: frequency,
      },
    });
  }
}
