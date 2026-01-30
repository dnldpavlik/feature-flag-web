import { Injectable, computed, inject, signal } from '@angular/core';
import { createId } from '@/app/shared/utils/id.utils';
import { TimeService } from '@/app/core/time/time.service';
import { AuditAction, AuditEntry, AuditResourceType, LogActionInput } from '../models/audit.model';

const MOCK_AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: 'audit_001',
    action: 'created',
    resourceType: 'flag',
    resourceId: 'flag_darkmode',
    resourceName: 'Dark Mode',
    details: 'Created boolean flag with default value false',
    userId: 'user_admin',
    userName: 'Admin User',
    timestamp: '2025-01-25T10:30:00.000Z',
  },
  {
    id: 'audit_002',
    action: 'toggled',
    resourceType: 'flag',
    resourceId: 'flag_newcheckout',
    resourceName: 'New Checkout Flow',
    details: 'Enabled flag in production environment',
    userId: 'user_john',
    userName: 'John Smith',
    timestamp: '2025-01-25T09:15:00.000Z',
  },
  {
    id: 'audit_003',
    action: 'updated',
    resourceType: 'segment',
    resourceId: 'seg_betausers',
    resourceName: 'Beta Users',
    details: 'Added 50 users to segment',
    userId: 'user_jane',
    userName: 'Jane Doe',
    timestamp: '2025-01-24T16:45:00.000Z',
  },
  {
    id: 'audit_004',
    action: 'created',
    resourceType: 'environment',
    resourceId: 'env_staging',
    resourceName: 'Staging',
    details: 'Created new staging environment',
    userId: 'user_admin',
    userName: 'Admin User',
    timestamp: '2025-01-24T14:00:00.000Z',
  },
  {
    id: 'audit_005',
    action: 'updated',
    resourceType: 'project',
    resourceId: 'proj_main',
    resourceName: 'Main Project',
    details: 'Updated project description and tags',
    userId: 'user_john',
    userName: 'John Smith',
    timestamp: '2025-01-24T11:30:00.000Z',
  },
  {
    id: 'audit_006',
    action: 'deleted',
    resourceType: 'flag',
    resourceId: 'flag_oldfeature',
    resourceName: 'Old Feature Toggle',
    details: 'Removed deprecated feature flag',
    userId: 'user_admin',
    userName: 'Admin User',
    timestamp: '2025-01-23T17:20:00.000Z',
  },
  {
    id: 'audit_007',
    action: 'toggled',
    resourceType: 'flag',
    resourceId: 'flag_maintenance',
    resourceName: 'Maintenance Mode',
    details: 'Disabled maintenance mode in all environments',
    userId: 'user_jane',
    userName: 'Jane Doe',
    timestamp: '2025-01-23T08:00:00.000Z',
  },
  {
    id: 'audit_008',
    action: 'created',
    resourceType: 'segment',
    resourceId: 'seg_enterprise',
    resourceName: 'Enterprise Customers',
    details: 'Created segment for enterprise tier users',
    userId: 'user_john',
    userName: 'John Smith',
    timestamp: '2025-01-22T15:30:00.000Z',
  },
  {
    id: 'audit_009',
    action: 'updated',
    resourceType: 'flag',
    resourceId: 'flag_darkmode',
    resourceName: 'Dark Mode',
    details: 'Changed targeting rules to include beta users',
    userId: 'user_jane',
    userName: 'Jane Doe',
    timestamp: '2025-01-22T10:15:00.000Z',
  },
  {
    id: 'audit_010',
    action: 'deleted',
    resourceType: 'segment',
    resourceId: 'seg_testusers',
    resourceName: 'Test Users',
    details: 'Removed unused test segment',
    userId: 'user_admin',
    userName: 'Admin User',
    timestamp: '2025-01-21T14:45:00.000Z',
  },
];

@Injectable({ providedIn: 'root' })
export class AuditStore {
  private readonly timeService = inject(TimeService);
  private readonly _entries = signal<AuditEntry[]>(MOCK_AUDIT_ENTRIES);

  readonly entries = this._entries.asReadonly();

  readonly totalCount = computed(() => this._entries().length);

  logAction(input: LogActionInput): void {
    const newEntry: AuditEntry = {
      ...input,
      id: createId('audit'),
      timestamp: this.timeService.now(),
    };

    this._entries.update((entries) => [newEntry, ...entries]);
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
