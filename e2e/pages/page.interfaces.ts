import { Locator } from '@playwright/test';

/**
 * Page Object Interfaces
 *
 * These interfaces define contracts for page object patterns used in E2E tests.
 * They enable consistent testing patterns and type-safe page object usage.
 */

/**
 * Base interface for all page objects.
 *
 * Every page object must have a path and basic navigation capabilities.
 */
export interface PageObject {
  /** URL path for this page (e.g., '/projects', '/flags/123') */
  readonly path: string;

  /** Navigate to this page */
  goto(): Promise<void>;

  /** Wait for page to finish loading */
  waitForPageLoad(): Promise<void>;

  /** Assert the browser is at this page's URL */
  assertAtPage(): Promise<void>;
}

/**
 * Interface for pages that display a list of items.
 *
 * Provides common patterns for list pages like tables and row access.
 */
export interface ListPageObject extends PageObject {
  /** Locator for all item rows */
  readonly itemRows: Locator;

  /** Get a specific row by name/text */
  itemRow(name: string | RegExp): Locator;

  /** Get the count of items displayed */
  getItemCount(): Promise<number>;

  /** Assert an item exists in the list */
  assertItemExists(name: string | RegExp): Promise<void>;

  /** Assert an item does not exist in the list */
  assertItemNotExists(name: string | RegExp): Promise<void>;

  /** Assert the item count matches expected */
  assertItemCount(expected: number): Promise<void>;
}

/**
 * Interface for list pages that support search/filtering.
 */
export interface SearchableListPageObject extends ListPageObject {
  /** Locator for the search input */
  readonly searchInput: Locator;

  /** Search for a term */
  search(term: string): Promise<void>;

  /** Clear the search */
  clearSearch(): Promise<void>;
}

/**
 * Interface for list pages with CRUD operations.
 *
 * Extends ListPageObject with create, edit, and delete capabilities.
 */
export interface CrudListPageObject extends ListPageObject {
  /** Locator for the create/add button */
  readonly createButton: Locator;

  /** Get the link for an item (to view details) */
  itemLink(name: string | RegExp): Locator;

  /** Get the edit button for an item */
  editButton(name: string | RegExp): Locator;

  /** Get the delete button for an item */
  deleteButton(name: string | RegExp): Locator;

  /** Click on an item to view details */
  clickItem(name: string | RegExp): Promise<void>;

  /** Click edit button for an item */
  clickEdit(name: string | RegExp): Promise<void>;

  /** Click delete button for an item */
  clickDelete(name: string | RegExp): Promise<void>;

  /** Delete an item with confirmation */
  deleteItem(name: string | RegExp): Promise<void>;

  /** Assert page has loaded (URL + key elements visible) */
  assertPageLoaded(): Promise<void>;
}

/**
 * Interface for pages with inline create forms.
 *
 * Many list pages have a form visible at the top for quick item creation.
 */
export interface InlineFormPageObject {
  /** Locator for the create form */
  readonly createForm: Locator;

  /** Locator for the save/submit button */
  readonly saveButton: Locator;

  /** Submit the form */
  submitForm(): Promise<void>;
}

/**
 * Interface for detail/edit pages.
 *
 * Pages that show details of a single item and allow editing.
 */
export interface DetailPageObject extends PageObject {
  /** Page title/header showing item name */
  readonly pageTitle: Locator;

  /** Back button to return to list */
  readonly backButton: Locator;

  /** Go back to the list page */
  goBack(): Promise<void>;

  /** Assert the page title matches */
  assertPageTitle(title: string | RegExp): Promise<void>;
}

/**
 * Interface for detail pages with edit capabilities.
 */
export interface EditableDetailPageObject extends DetailPageObject {
  /** Save button for edits */
  readonly saveButton: Locator;

  /** Cancel button to discard changes */
  readonly cancelButton: Locator;

  /** Delete button to remove the item */
  readonly deleteButton: Locator;

  /** Save changes */
  save(): Promise<void>;

  /** Cancel and discard changes */
  cancel(): Promise<void>;

  /** Delete the current item */
  delete(): Promise<void>;
}

/**
 * Interface for pages that support the "default" item pattern.
 *
 * Used for pages where items can be marked as default (e.g., environments, projects).
 */
export interface DefaultableListPageObject extends CrudListPageObject {
  /** Get the default badge for an item */
  defaultBadge(name: string | RegExp): Locator;

  /** Assert an item is marked as default */
  assertIsDefault(name: string | RegExp): Promise<void>;
}

/**
 * Interface for pages with toggle controls in rows.
 *
 * Used for pages with enable/disable toggles (e.g., flags).
 */
export interface ToggleableListPageObject extends ListPageObject {
  /** Click a toggle in a row */
  clickToggleInRow(rowText: string | RegExp): Promise<boolean>;

  /** Toggle and verify state changed */
  toggleAndVerifyInRow(rowText: string | RegExp): Promise<{ initial: boolean; final: boolean }>;
}

/**
 * Interface for modal/dialog interactions.
 */
export interface ModalPageObject {
  /** Locator for the modal container */
  readonly modal: Locator;

  /** Check if modal is open */
  isModalOpen(): Promise<boolean>;

  /** Close the modal */
  closeModal(): Promise<void>;

  /** Confirm the modal action */
  confirmModal(): Promise<void>;

  /** Cancel the modal action */
  cancelModal(): Promise<void>;
}

/**
 * Interface for pages with empty state handling.
 */
export interface EmptyStatePageObject {
  /** Locator for the empty state component */
  readonly emptyState: Locator;

  /** Check if empty state is visible */
  isEmptyStateVisible(): Promise<boolean>;

  /** Assert empty state is shown */
  assertEmptyState(): Promise<void>;
}
