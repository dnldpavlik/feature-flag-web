export type AuditAction = 'created' | 'updated' | 'deleted' | 'toggled';
export type AuditResourceType = 'flag' | 'environment' | 'project' | 'segment';

/**
 * Audit action filter options for list views.
 */
export const AUDIT_ACTION_OPTIONS: readonly { value: 'all' | AuditAction; label: string }[] = [
  { value: 'all', label: 'All Actions' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
  { value: 'toggled', label: 'Toggled' },
] as const;

/**
 * Audit resource type filter options for list views.
 */
export const AUDIT_RESOURCE_OPTIONS: readonly {
  value: 'all' | AuditResourceType;
  label: string;
}[] = [
  { value: 'all', label: 'All Resources' },
  { value: 'flag', label: 'Flag' },
  { value: 'segment', label: 'Segment' },
  { value: 'environment', label: 'Environment' },
  { value: 'project', label: 'Project' },
] as const;

export interface AuditEntry {
  id: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName: string;
  details: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface LogActionInput {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName: string;
  details: string;
  userId: string;
  userName: string;
}
