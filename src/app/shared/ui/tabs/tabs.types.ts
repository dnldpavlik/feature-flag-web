import { IconName } from '../icon/icon.types';

/** Individual tab item configuration */
export interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Optional icon to display before the label */
  icon?: IconName;
  /** Whether the tab is disabled */
  disabled?: boolean;
}
