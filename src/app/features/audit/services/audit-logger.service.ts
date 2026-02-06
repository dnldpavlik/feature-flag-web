import { inject, Injectable } from '@angular/core';

import { AuditStore } from '../store/audit.store';
import { AuditAction, AuditResourceType } from '../models/audit.model';
import { UserProfileStore } from '@/app/features/settings/store/user-profile.store';

export interface AuditLogInput {
  action: AuditAction;
  resourceId: string;
  resourceName: string;
  details: string;
}

export type ResourceLogger = (input: AuditLogInput) => void;

@Injectable({ providedIn: 'root' })
export class AuditLogger {
  private readonly auditStore = inject(AuditStore);
  private readonly userProfileStore = inject(UserProfileStore);

  /**
   * Log an audit action for a specific resource type.
   */
  log(resourceType: AuditResourceType, input: AuditLogInput): void {
    const user = this.userProfileStore.userProfile();
    this.auditStore.logAction({
      ...input,
      resourceType,
      userId: user.id,
      userName: user.name,
    });
  }

  /**
   * Create a logger function bound to a specific resource type.
   * Useful for stores that always log the same resource type.
   *
   * @example
   * ```typescript
   * private readonly logAudit = inject(AuditLogger).forResource('flag');
   *
   * // Later in the store:
   * this.logAudit({
   *   action: 'created',
   *   resourceId: flag.id,
   *   resourceName: flag.name,
   *   details: 'Created flag',
   * });
   * ```
   */
  forResource(resourceType: AuditResourceType): ResourceLogger {
    return (input: AuditLogInput) => this.log(resourceType, input);
  }
}
