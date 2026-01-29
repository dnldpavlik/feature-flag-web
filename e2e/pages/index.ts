/**
 * Page Objects barrel export
 *
 * @description Central export for all page objects used in E2E tests.
 *
 * @example
 * ```ts
 * import { DashboardPage, FlagListPage, FlagCreatePage } from '../pages';
 *
 * test('create a flag', async ({ page }) => {
 *   const flagList = new FlagListPage(page);
 *   const flagCreate = new FlagCreatePage(page);
 *   // ...
 * });
 * ```
 */

// Base
export { BasePage } from './base.page';

// Dashboard
export { DashboardPage } from './dashboard.page';

// Flags
export { FlagListPage, FlagCreatePage, FlagDetailPage } from './flags';
export type { FlagFormData, FlagType } from './flags';

// Environments
export { EnvironmentListPage, EnvironmentDetailPage } from './environments';
export type { EnvironmentFormData } from './environments';

// Projects
export { ProjectListPage, ProjectDetailPage } from './projects';
export type { ProjectFormData } from './projects';

// Segments
export { SegmentListPage } from './segments';
export type { SegmentFormData } from './segments';

// Audit
export { AuditPage } from './audit.page';
export type { AuditAction, AuditResourceType } from './audit.page';

// Settings
export { SettingsPage } from './settings.page';
export type { ThemeMode } from './settings.page';
