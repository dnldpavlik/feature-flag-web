/**
 * Testing Utilities
 *
 * Central export for all test helpers.
 *
 * Usage in test files:
 * import { expectHeading, createMockFlag, setupComponentTest } from '@/app/testing';
 */

// DOM query and assertion helpers
export {
  query,
  queryAll,
  getTableRows,
  getRowCount,
  expectExists,
  expectNotExists,
  expectTextContains,
  expectHeading,
  expectEmptyState,
  expectNoEmptyState,
  expectRowCount,
} from './dom.helpers';

// Store testing helpers
export {
  expectSignal,
  expectHasItems,
  expectEmpty,
  expectItemCount,
  expectItemNotExists,
  getCountBefore,
  expectItemAdded,
  expectItemRemoved,
  findByKey,
} from './store.helpers';

// Component setup helpers
export {
  setupComponentTest,
  createComponentFixture,
  getComponent,
  injectService,
  setFormField,
  getFormField,
  setFormFields,
} from './component.helpers';

// Detail component helpers
export {
  type DetailComponentConfig,
  type DetailComponentTestContext,
  createMockLocation,
  createMockActivatedRoute,
  setupDetailComponentTest,
} from './detail-component.helpers';

// Mock API providers
export {
  MOCK_API_PROVIDERS,
  MOCK_PROJECTS,
  MOCK_ENVIRONMENTS,
  MOCK_FLAGS,
  MOCK_SEGMENTS,
  MOCK_API_KEYS,
} from './mock-api.providers';
