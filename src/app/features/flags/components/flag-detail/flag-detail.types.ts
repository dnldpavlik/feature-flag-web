import { FlagType } from '@/app/features/flags/models/flag.model';
import { FlagTypeMap } from '@/app/features/flags/models/flag-value.model';

export interface FlagEnvironmentRow {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  value: FlagTypeMap[FlagType];
}
