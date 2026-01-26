export type AuditAction = 'created' | 'updated' | 'deleted' | 'toggled';
export type AuditResourceType = 'flag' | 'environment' | 'project' | 'segment';

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
