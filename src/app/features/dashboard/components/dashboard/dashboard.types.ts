import { Flag } from '@/app/features/flags/models/flag.model';
import { HighlightPart } from '@/app/shared/utils/search.types';

export type RecentFlag = Flag & { currentEnabled: boolean };

export interface RecentFlagWithHighlights extends RecentFlag {
  nameParts: HighlightPart[];
  keyParts: HighlightPart[];
  descriptionParts: HighlightPart[];
}
