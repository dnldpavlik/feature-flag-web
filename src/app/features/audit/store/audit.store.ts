import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ToastService } from '@watt/ui';
import { AuditApi } from '../api/audit.api';
import { AuditAction, AuditEntry, AuditResourceType, LogActionInput } from '../models/audit.model';

@Injectable({ providedIn: 'root' })
export class AuditStore {
  private readonly api = inject(AuditApi);
  private readonly toast = inject(ToastService);
  private readonly _entries = signal<AuditEntry[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly entries = this._entries.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly totalCount = computed(() => this._entries().length);

  async loadEntries(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const entries = await firstValueFrom(this.api.getAll());
      this._entries.set(entries);
    } catch {
      this._error.set('Failed to load audit entries');
      this.toast.error('Failed to load audit entries');
    } finally {
      this._loading.set(false);
    }
  }

  async logAction(input: LogActionInput): Promise<void> {
    try {
      const created = await firstValueFrom(this.api.create(input));
      this._entries.update((entries) => [created, ...entries]);
    } catch {
      this.toast.error('Failed to log audit entry');
    }
  }

  getEntryById(id: string): AuditEntry | undefined {
    return this._entries().find((entry) => entry.id === id);
  }

  entriesByAction(action: AuditAction): AuditEntry[] {
    return this._entries().filter((entry) => entry.action === action);
  }

  entriesByResourceType(resourceType: AuditResourceType): AuditEntry[] {
    return this._entries().filter((entry) => entry.resourceType === resourceType);
  }
}
