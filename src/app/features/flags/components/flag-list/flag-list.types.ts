import { Flag, FlagType } from '@/app/features/flags/models/flag.model';
import { FlagTypeMap } from '@/app/features/flags/models/flag-value.model';

export type StatusFilter = 'all' | 'enabled' | 'disabled';
export type TypeFilter = 'all' | FlagType;

/**
 * Extended flag with computed environment-specific properties for display
 */
export interface FlagWithEnvironmentStatus extends Flag {
  currentEnabled: boolean;
  currentValue: FlagTypeMap[FlagType];
}
