export interface BreadcrumbSelectOption {
  id: string;
  label: string;
}

/** Represents a single breadcrumb item */
export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** Optional route to navigate to (if omitted, item is not a link) */
  route?: string;
  /** Optional key for selection handling */
  key?: string;
  /** Optional select options for a dropdown crumb */
  selectOptions?: BreadcrumbSelectOption[];
  /** Optional selected option id */
  selectedId?: string;
}
