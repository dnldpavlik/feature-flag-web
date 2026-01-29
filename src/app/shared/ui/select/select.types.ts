/** Represents a single option in a select dropdown */
export interface SelectOption {
  /** The value that will be emitted when this option is selected */
  value: string;
  /** The display text shown to the user */
  label: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}
