# Module Review: features/segments -- 2026-02-13

## Module Summary
- **Path:** `src/app/features/segments/`
- **Purpose:** Segment CRUD management with rule builder for defining user targeting criteria (attribute/operator/value rules). Provides list view, detail/edit view, inline rule editing, and a composable rule builder form.
- **File Count:** 12 production, 6 test
- **Test Coverage:** 6/6 testable files have specs (segment.api, segment.store, segment-rule.utils, segment-list, segment-detail, rule-builder, rule-row)

## File Inventory

| File | Type | Lines |
|------|------|-------|
| `segments.routes.ts` | Routes | 16 |
| `models/segment.model.ts` | Model | 18 |
| `models/segment-rule.model.ts` | Model | 68 |
| `api/segment.api.ts` | API | 33 |
| `api/segment.api.spec.ts` | Test | 167 |
| `store/segment.store.ts` | Store | 142 |
| `store/segment.store.spec.ts` | Test | 523 |
| `utils/segment-rule.utils.ts` | Utility | 159 |
| `utils/segment-rule.utils.spec.ts` | Test | 517 |
| `components/segment-list/segment-list.ts` | Component | 77 |
| `components/segment-list/segment-list.spec.ts` | Test | 95 |
| `components/segment-list/segment-list.html` | Template | 69 |
| `components/segment-list/segment-list.scss` | Styles | 60 |
| `components/segment-detail/segment-detail.ts` | Component | 96 |
| `components/segment-detail/segment-detail.spec.ts` | Test | 334 |
| `components/segment-detail/segment-detail.html` | Template | 99 |
| `components/segment-detail/segment-detail.scss` | Styles | 195 |
| `components/rule-builder/rule-builder.ts` | Component | 91 |
| `components/rule-builder/rule-builder.spec.ts` | Test | 300 |
| `components/rule-builder/rule-builder.html` | Template | 56 |
| `components/rule-builder/rule-builder.scss` | Styles | 79 |
| `components/rule-row/rule-row.ts` | Component | 82 |
| `components/rule-row/rule-row.spec.ts` | Test | 320 |
| `components/rule-row/rule-row.html` | Template | 47 |
| `components/rule-row/rule-row.scss` | Styles | 81 |

## Issues Found

### Architecture / SOLID

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `api/segment.api.ts` | 8-12 | `UpdateSegmentInput` is defined in the API file instead of alongside `CreateSegmentInput` in `segment.model.ts`. This violates the model patterns established in `CLAUDE.md` and splits related types across files. The `segment-detail.ts` component imports it from the API. | Major |
| `segment.model.ts` | 1-18 | No `UpdateSegmentInput` type defined here alongside `CreateSegmentInput`. Every other feature module co-locates create/update input types in the model file. | Major |
| `rule-row.ts` | 61-69 | `saveEdit()` duplicates array-parsing logic (`split(',').map().filter()`) that already exists in `parseArrayValue()` from `segment-rule.utils.ts`. Violates DRY and the project's functional composition principle. The rule-builder component correctly uses `parseArrayValue`, but rule-row does not. | Major |
| `segment-list.ts` | 55-58 | `canAdd()` is a regular method, not a `computed()` signal. With `OnPush` change detection, the template binding `[disabled]="!canAdd()"` will only re-evaluate on change detection cycles triggered by other signals or events. This works coincidentally because `(click)` triggers CD, but it is inconsistent with the signals-first architecture and could break under certain conditions. Should be `protected readonly canAdd = computed(...)`. | Major |
| `segment-detail.ts` | 67-77 | Three separate `onNameInput`, `onKeyInput`, `onDescriptionInput` methods that each extract `event.target.value` and set a signal. This is boilerplate that could be consolidated into a single generic handler, e.g., `onInput(signal: WritableSignal<string>, event: Event)`. | Minor |

### Type Safety

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `rule-row.ts` | 62 | `this.editOperator() as SegmentRule['operator']` uses a type assertion instead of properly typing `editOperator` as `signal<RuleOperator>('')`. The empty string initial value `''` is not a valid `RuleOperator`, causing the need for the cast. Should be typed as `signal<RuleOperator | ''>('')` or better, initialized with a valid default like `'equals'`. | Major |
| `rule-row.ts` | 26-28 | `editAttribute`, `editOperator`, `editValue` are typed as `signal('')` (inferred `WritableSignal<string>`) which loses the `RuleOperator` type for `editOperator`. | Minor |
| `segment-detail.spec.ts` | 302, 306-307, 311, 314-316, 325-326, 330 | Heavy use of `(nullComponent as never)['...']` to access protected members. This is acceptable per the `CLAUDE.md` rule allowing `any`/type escape in `.spec.ts` files, but six occurrences in a single describe block suggest the component could benefit from a small testability improvement. | Suggestion |

### BEM / SCSS

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `segment-list.scss` | 22-26 | `&:hover` used inside `.segment-name--link`. The `CLAUDE.md` conventions state "BEM naming for all SCSS" and discourage nesting with `&`. The full selector `.segment-name--link:hover` should be written explicitly. | Minor |
| `segment-detail.scss` | 17-20 | `&:hover` nested inside `.segment-detail__back-link`. Should be `.segment-detail__back-link:hover`. | Minor |
| `segment-detail.scss` | 59-63 | Nested `h2` selector inside `.segment-detail__section-header`. Should use a BEM element class like `.segment-detail__section-title`. | Minor |
| `segment-detail.scss` | 131-135 | Nested `h2` inside `.segment-detail__rules-header`. Same issue -- should use a BEM element class. | Minor |
| `segment-detail.scss` | 148-150 | Nested `strong` inside `.segment-detail__rules-hint`. Should use a BEM element class. | Minor |
| `segment-detail.scss` | 167-172 | Nested `h3` inside `.segment-detail__add-rule`. Should use a BEM element class. | Minor |
| `segment-detail.scss` | 179-181 | Nested `h2` inside `.segment-detail__not-found`. Should use a BEM element class. | Minor |
| `segment-detail.scss` | 183-186 | Nested `p` inside `.segment-detail__not-found`. Should use a BEM element class. | Minor |
| `segment-list.scss` | 40-42 | Nested `h2` inside `.segment-form__header`. Should use a BEM element class like `.segment-form__title`. | Minor |
| `rule-builder.scss` | 40-44 | `&:focus` nested inside grouped selectors. Should be written as separate `.rule-builder__attribute-select:focus`, etc. | Minor |
| `rule-row.scss` | 65-69 | `&:focus` nested inside grouped selectors. Same nesting issue. | Minor |
| `segment-detail.scss` | 106-110 | `&:focus` nested inside grouped input selectors. Same nesting issue. | Minor |

### Functional Programming / Composition

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `segment-rule.utils.ts` | 136-141 | `formatRuleValue` takes an `operator` parameter but never uses it. The function signature suggests operator-specific formatting was planned but not implemented. The parameter should either be removed or the function should vary behavior by operator. | Minor |
| `segment-rule.utils.ts` | 112-131 | `validateRuleInput` does not validate the `operator` field, even though `RuleOperator` is a union type. If an invalid operator string were somehow passed (e.g., from a malformed API response or form manipulation), it would pass validation. | Suggestion |
| `segment.store.ts` | 102-111, 114-128, 130-141 | `addRule`, `updateRule`, and `removeRule` all use the identical pattern of mapping over `_items` and replacing the matching segment. This could be extracted into a private helper method like `replaceSegment(segmentId, updated)` to reduce repetition. | Suggestion |

### Template Patterns

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `segment-detail.html` | 79 | `(removed)="onRuleRemoved($event)"` emits the rule ID from the rule-row's `removed` output, but the rule ID is already available as `rule.id` in the template's `@for` loop. The binding could be `(removed)="onRuleRemoved(rule.id)"` for clarity, avoiding reliance on the child component's event payload echoing the ID back. Both approaches work; this is a style consistency matter. | Suggestion |
| `segment-list.html` | 39 | `segments().length > 1` guard for showing the delete button queries the full unfiltered segment list, which is correct (prevents deleting the last segment globally), but this same logic is also in the store's `deleteSegment`. The UI guard is good UX but consider adding a `canDelete` computed signal for consistency. | Suggestion |

### Test Quality

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `segment-list.spec.ts` | 48-58 | The `addSegment` test accesses `component.form` and `component.addSegment()` which are `protected` members. This works because TypeScript only enforces access modifiers at compile time, but is fragile. Better to interact through the template (set input values, dispatch events, click the button). | Minor |
| `segment-list.spec.ts` | 60-66 | Same issue: directly calling `component.addSegment()` instead of clicking the UI button. | Minor |
| `segment.api.spec.ts` | 98 | Test description says "should PATCH /segments/:id" but this is actually the expected behavior from `CrudApi.update()`. The `UpdateSegmentInput` interface uses `PATCH` (confirmed via `CrudApi`), which is correct. No issue here. | -- |

### Missing Functionality

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `segment-detail.ts` | 53-65 | `saveEdit()` always sends all three fields (`name`, `key`, `description`) even if only one changed. This sends unnecessary data over the wire. A diff against the original segment values would be more efficient and produce cleaner audit logs (the store logs "Updated segment fields: name, key, description" even for a single-field change). | Minor |
| `segment.store.ts` | 102-141 | Rule operations (`addRule`, `updateRule`, `removeRule`) do not produce audit log entries, unlike the segment-level CRUD operations. This creates an audit gap where rule changes are invisible in the audit trail. | Minor |
| `segment-detail.html` | 1-99 | No loading state handling. If `segment()` is undefined because data hasn't loaded yet (vs. not found), the user sees the "Segment Not Found" state. There is no distinction between "loading" and "not found". | Minor |

## What's Done Well

- **Excellent utility design.** `segment-rule.utils.ts` follows functional programming principles perfectly: pure functions, immutable operations, injectable `TimeProvider` for testability, and clear single-responsibility. Functions like `addRuleToSegment`, `updateRuleInSegment`, `removeRuleFromSegment` compose immutable segment transformations elegantly.
- **Thorough test coverage.** The utility spec has 517 lines covering all functions exhaustively, including edge cases (whitespace-only input, empty arrays, nonexistent rule IDs, unknown operators). The store spec covers 523 lines including all CRUD paths, error handling, and audit logging.
- **Clean model separation.** `Segment` and `SegmentRule` are well-defined with proper separation of domain models from input types (`CreateSegmentInput`, `CreateSegmentRuleInput`, `UpdateSegmentRuleInput`). The `RuleOperator` union type and `OPERATOR_OPTIONS` / `COMMON_ATTRIBUTES` const arrays follow established project patterns.
- **Correct Angular conventions.** All components use `ChangeDetectionStrategy.OnPush`, `input()` / `input.required()` / `output()` signal APIs, `inject()` for DI, and `@if` / `@for` control flow. No NgModules, no `*ngIf`, no constructor injection.
- **Proper store pattern.** `SegmentStore` correctly extends `BaseCrudStore<Segment>`, uses `firstValueFrom` for API calls, provides convenient aliases (`segments`, `segmentCount`), and handles errors with toast notifications.
- **Rule builder is well-composed.** The `RuleBuilderComponent` uses computed signals for derived state (`isCustomAttribute`, `isArrayOperator`, `valuePlaceholder`, `effectiveAttribute`, `canAdd`), demonstrating good reactive composition. Form reset after submission is clean.
- **API design.** `SegmentApi` cleanly extends `CrudApi` and adds rule-specific sub-resource methods (`addRule`, `updateRule`, `deleteRule`) with proper REST URL patterns.
- **Responsive design.** All SCSS files include `@media` breakpoints for mobile/tablet adaptation. The grid layouts degrade gracefully to single-column on narrow viewports.
- **Error handling.** Every store method has try/catch with user-facing toast messages. The delete-last guard prevents data loss.
- **Immutability.** All store updates use immutable patterns (spread, filter, map). The utility functions are pure and never mutate arguments, verified by tests.

## Recommended Fixes (Priority Order)

1. **Move `UpdateSegmentInput` to `models/segment.model.ts`** (Major). Co-locate it with `CreateSegmentInput` to match the pattern used by flags, projects, and environments. Update imports in `segment.api.ts` and `segment-detail.ts`.

2. **Use `parseArrayValue` in `rule-row.ts` `saveEdit()`** (Major). Replace the inline `split(',').map().filter()` at line 64-68 with `parseArrayValue` from `segment-rule.utils.ts` to eliminate duplicated logic and ensure consistent parsing behavior.

3. **Convert `canAdd()` to a computed signal in `segment-list.ts`** (Major). Change from a method to `protected readonly canAdd = computed(() => { ... })` and update the template from `!canAdd()` to `!canAdd()` (same syntax, but now it's a signal evaluation). This ensures proper change detection with `OnPush`.

4. **Type `editOperator` properly in `rule-row.ts`** (Major). Change `signal('')` to `signal<RuleOperator>('equals')` to eliminate the type assertion at line 62 and maintain type safety throughout the editing flow.

5. **Fix BEM nesting in SCSS files** (Minor, batch). Replace all `&:hover`, `&:focus`, and nested element selectors (`h2`, `h3`, `p`, `strong`) with explicit BEM class names per project conventions. This affects `segment-list.scss`, `segment-detail.scss`, `rule-builder.scss`, and `rule-row.scss`.

6. **Remove unused `operator` parameter from `formatRuleValue`** (Minor). If operator-specific formatting is not needed, simplify the signature to `formatRuleValue(value: string | string[]): string`. Update all call sites.

7. **Add audit logging for rule operations** (Minor). Add `logAudit` calls to `addRule`, `updateRule`, and `removeRule` in `segment.store.ts` to close the audit gap for rule-level changes.

8. **Extract `replaceSegment` helper in `segment.store.ts`** (Suggestion). Consolidate the repeated `_items.update(segments => segments.map(...))` pattern in the three rule methods into a private helper.

9. **Add loading state distinction in `segment-detail.html`** (Minor). Check the store's `loading` signal to distinguish between "data is loading" and "segment not found" states, preventing a flash of "Segment Not Found" on initial load.

10. **Send only changed fields in `segment-detail.ts` `saveEdit()`** (Minor). Compare edited values against the original segment to build a minimal `UpdateSegmentInput`, reducing unnecessary network payload and producing accurate audit logs.
