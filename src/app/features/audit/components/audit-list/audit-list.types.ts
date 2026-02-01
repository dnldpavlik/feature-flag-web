import { AuditAction, AuditEntry, AuditResourceType } from '../../models/audit.model';

export type ActionFilter = 'all' | AuditAction;
export type ResourceFilter = 'all' | AuditResourceType;

export interface AuditEntryFormatted extends AuditEntry {
  formattedAction: string;
  formattedResourceType: string;
}
