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
  getText,
  exists,
  getTableRows,
  getRowCount,
  expectExists,
  expectNotExists,
  expectTextContains,
  expectHeading,
  expectEmptyState,
  expectNoEmptyState,
  expectRowCount,
  expectHasClass,
  expectButton,
  click,
  setInputValue,
} from './dom.helpers';

// Store testing helpers
export {
  type StoreItem,
  type CrudTestConfig,
  expectSignal,
  expectHasItems,
  expectEmpty,
  expectItemCount,
  expectItemExists,
  expectItemNotExists,
  expectIdPattern,
  expectTimestamp,
  expectTimestamps,
  getCountBefore,
  expectItemAdded,
  expectItemRemoved,
  findByKey,
  findById,
  expectItemProperty,
  testStoreCrud,
} from './store.helpers';

// Component setup helpers
export {
  type ComponentTestConfig,
  setupComponentTest,
  createComponentFixture,
  detectChangesAndWait,
  dispatchInputEvent,
  dispatchChangeEvent,
  dispatchBlurEvent,
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

// Mock factories
export {
  mockId,
  mockTimestamp,
  type MockItem,
  createMockItem,
  type MockFlag,
  createMockFlag,
  type MockProject,
  createMockProject,
  type MockEnvironment,
  createMockEnvironment,
  type MockSegment,
  type MockSegmentRule,
  createMockSegmentRule,
  createMockSegment,
  type MockAuditLog,
  createMockAuditLog,
  type MockApiKey,
  createMockApiKey,
  createMockList,
} from './mock.factories';
