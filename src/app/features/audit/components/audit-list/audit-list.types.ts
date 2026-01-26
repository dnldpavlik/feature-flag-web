import { AuditAction, AuditResourceType } from '../../models/audit.model';

export type ActionFilter = 'all' | AuditAction;
export type ResourceFilter = 'all' | AuditResourceType;
