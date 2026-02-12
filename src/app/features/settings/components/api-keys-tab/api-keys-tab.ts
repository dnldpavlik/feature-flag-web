import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ButtonComponent, DataTableComponent, UiColDirective } from '@watt/ui';
import { ApiKeyStore } from '../../store/api-key.store';
import { API_KEY_SCOPE_OPTIONS, type ApiKeyScope } from '../../models/settings.model';

@Component({
  selector: 'app-api-keys-tab',
  imports: [DatePipe, ButtonComponent, DataTableComponent, UiColDirective],
  templateUrl: './api-keys-tab.html',
  styleUrl: './api-keys-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiKeysTabComponent {
  private readonly apiKeyStore = inject(ApiKeyStore);

  private readonly rawApiKeys = computed(() => this.apiKeyStore.apiKeys());
  protected readonly apiKeys = computed(() =>
    this.rawApiKeys().map((key) => ({
      ...key,
      formattedScopes: key.scopes.join(', '),
    })),
  );
  protected readonly hasKeys = computed(() => this.apiKeys().length > 0);
  protected readonly availableScopes = API_KEY_SCOPE_OPTIONS;

  // Create form state
  protected readonly showCreateForm = signal(false);
  protected readonly newKeyName = signal('');
  protected readonly selectedScopes = signal<ApiKeyScope[]>([]);

  // Secret display state
  protected readonly createdSecret = signal<string | null>(null);

  // Revoke confirmation state
  protected readonly keyToRevoke = signal<string | null>(null);

  protected readonly canSubmit = computed(
    () => this.newKeyName().trim().length > 0 && this.selectedScopes().length > 0,
  );

  protected openCreateForm(): void {
    this.showCreateForm.set(true);
    this.newKeyName.set('');
    this.selectedScopes.set([]);
  }

  protected closeCreateForm(): void {
    this.showCreateForm.set(false);
    this.newKeyName.set('');
    this.selectedScopes.set([]);
  }

  protected onNameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newKeyName.set(value);
  }

  protected onScopeToggle(scope: ApiKeyScope, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedScopes.update((scopes) => [...scopes, scope]);
    } else {
      this.selectedScopes.update((scopes) => scopes.filter((s) => s !== scope));
    }
  }

  protected isScopeSelected(scope: ApiKeyScope): boolean {
    return this.selectedScopes().includes(scope);
  }

  protected async createKey(): Promise<void> {
    if (!this.canSubmit()) return;

    const result = await this.apiKeyStore.createApiKey({
      name: this.newKeyName().trim(),
      scopes: this.selectedScopes(),
    });

    if (result) {
      this.createdSecret.set(result.secret);
    }
    this.closeCreateForm();
  }

  protected dismissSecret(): void {
    this.createdSecret.set(null);
  }

  protected async copySecret(): Promise<void> {
    const secret = this.createdSecret();
    if (secret && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(secret);
    }
  }

  protected confirmRevoke(keyId: string): void {
    this.keyToRevoke.set(keyId);
  }

  protected cancelRevoke(): void {
    this.keyToRevoke.set(null);
  }

  protected async revokeKey(): Promise<void> {
    const keyId = this.keyToRevoke();
    if (keyId) {
      await this.apiKeyStore.revokeApiKey(keyId);
      this.keyToRevoke.set(null);
    }
  }
}
