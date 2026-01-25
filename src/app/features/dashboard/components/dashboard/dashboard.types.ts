import { Flag } from '@/app/features/flags/models/flag.model';

export type RecentFlag = Flag & { currentEnabled: boolean };
