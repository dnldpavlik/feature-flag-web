# Module Review: features/settings -- 2026-02-13

## Module Summary
- **Path:** `src/app/features/settings/`
- **Purpose:** User settings management with four tabs: Profile (user info + password change), Preferences (default environment, notifications, email digest), API Keys (CRUD with secret display), and Appearance (theme mode, accessibility options).
- **File Count:** 16 production files, 7 test files
- **Test Coverage:** 7/7 testable files have specs (settings-page, user-profile-tab, preferences-tab, theme-tab, api-keys-tab, api-key.api, api-key.store, user-profile.store, preferences.store)

## Issues Found

### Architecture / SOLID Violations

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `store/user-profile.store.ts` | 7-12 | **Hardcoded user profile instead of using AuthService.** The store initializes with `{ id: 'user_1', name: 'John Doe', email: 'john.doe@example.com' }` instead of reading from `AuthService.userProfile()`. The settings module defines its own `UserProfile` interface (`models/settings.model.ts` L1-7) that conflicts with `core/auth/auth.models.ts` (which has `username`, `firstName`, `lastName`, `fullName` fields). The user profile tab should inject `AuthService` and derive profile data from the Keycloak-provided identity, not maintain a separate hardcoded copy. | **Blocker** |
| `store/user-profile.store.ts` | 1-39 | **Store has no API integration.** `updateUserProfile()` only updates local signal state. There is no HTTP call to persist profile changes to the backend, making the "Save Profile" button a no-op. Other stores (`ApiKeyStore`) correctly use `firstValueFrom()` with API calls. | **Major** |
| `components/user-profile-tab/user-profile-tab.ts` | 90-98 | **Password change is completely stubbed.** The `changePassword()` method just clears form fields with a comment `// In a real app, this would call an API`. There is no API service for password changes. Since Keycloak manages authentication, password changes should delegate to Keycloak's account management URL, not implement a custom password form. | **Major** |
| `models/settings.model.ts` | 1-7, 63-64 | **Duplicate UserProfile interface.** The settings module defines its own `UserProfile` with `{ id, name, email, avatarUrl }` while `core/auth/auth.models.ts` defines a different `UserProfile` with `{ username, email, firstName, lastName, fullName }`. This creates a confusing dual-model situation. Settings should reuse or extend the auth model. | **Major** |
| `models/settings.model.ts` | 73-81 | **SettingsState interface is unused.** The `SettingsState` combined interface is defined but never referenced by any component or store. Dead code. | **Minor** |

### Angular Conventions

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `components/settings-page/settings-page.ts` | 36-38 | **Unsafe type cast in `onTabChange`.** Uses `tabId as SettingsTab` without validation. If `TabsComponent` emits an unexpected string, it would silently assign an invalid value. Should validate the tab ID. | **Minor** |
| `components/user-profile-tab/user-profile-tab.ts` | 19-20 | **Signal initialized from store snapshot, not reactive.** `profileName` and `profileEmail` are initialized with `signal(this.userProfileStore.userProfile().name)` -- this captures the value at construction time and will not update if the store profile changes externally. Should use an `effect()` or `computed()` to stay in sync, or initialize lazily. | **Major** |
| `components/api-keys-tab/api-keys-tab.ts` | 69-71 | **`isScopeSelected()` is a method call in template, not a signal/computed.** Called per scope per change detection cycle. Should be a computed signal or use a set-based approach for O(1) lookup. | **Minor** |
| `components/user-profile-tab/user-profile-tab.ts` | 58-81 | **Five nearly identical event handler methods.** `onNameInput`, `onEmailInput`, `onCurrentPasswordInput`, `onNewPasswordInput`, `onConfirmPasswordInput` all follow the same pattern of `(event.target as HTMLInputElement).value` then `signal.set(value)`. Could be consolidated into a single generic handler or use a helper function. | **Suggestion** |

### SCSS / BEM Violations

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `components/settings-page/settings-page.scss` | 8-13 | **Uses `&__content` nesting instead of full BEM class name.** Project convention requires `.settings-page__content { }` written out fully, not `&__content`. | **Major** |
| `components/user-profile-tab/user-profile-tab.scss` | 6-128 | **All selectors use `&__element` nesting.** Every BEM element class (e.g., `&__section`, `&__avatar`, `&__form`, etc.) uses the `&` parent selector shorthand. Per project CLAUDE.md BEM rules, these should be written as full class names like `.user-profile-tab__section { }`. | **Major** |
| `components/preferences-tab/preferences-tab.scss` | 6-114 | **All selectors use `&__element` nesting.** Same issue -- every BEM element uses `&__` shorthand instead of full `.preferences-tab__section`, `.preferences-tab__toggle`, etc. | **Major** |
| `components/theme-tab/theme-tab.scss` | 6-114 | **All selectors use `&__element` nesting.** Same pattern. Should be `.theme-tab__section`, `.theme-tab__option`, etc. | **Major** |
| `components/api-keys-tab/api-keys-tab.scss` | 6-183 | **All selectors use `&__element` nesting.** Same pattern throughout. | **Major** |

### Type Safety

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `components/user-profile-tab/user-profile-tab.ts` | 59, 64, 69, 74, 79 | **Repeated `(event.target as HTMLInputElement)` cast.** While not `any`, the repeated unsafe cast could be extracted into a typed utility. The project has `form.utils.ts` with helpers that could be leveraged. | **Suggestion** |
| `components/preferences-tab/preferences-tab.ts` | 43, 53 | **Repeated `(event.target as HTMLInputElement).checked` cast.** Same pattern as above; could use a helper. | **Suggestion** |

### Testing

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `store/user-profile.store.spec.ts` | 17-24 | **Tests assert against hardcoded values.** `expect(profile.id).toBeDefined()` etc. just checks existence of hardcoded defaults. Should assert exact expected values to catch regressions, or better yet, test integration with AuthService. | **Minor** |
| `components/user-profile-tab/user-profile-tab.spec.ts` | 184, 191 | **Accessing private members via bracket notation.** `component['currentPassword']()`, `component['changePassword']()` etc. access protected/private members. While functional, this pattern bypasses encapsulation. Should test via the DOM or expose a test-friendly API. | **Minor** |
| `components/api-keys-tab/api-keys-tab.spec.ts` | 93 | **Directly setting signal in test: `component.showCreateForm.set(true)`.** The `showCreateForm` signal is declared `protected` in the component but is accessed directly in tests. This works because TypeScript access modifiers are compile-time only, but it bypasses the intended component API. | **Minor** |
| `components/theme-tab/theme-tab.spec.ts` | 12-21 | **No ThemeService mock or verification.** Tests provide only `PreferencesStore` but not `ThemeService` (which PreferencesStore injects). This works because PreferencesStore is `providedIn: 'root'` but hides a dependency. Tests should verify that theme changes actually reach `ThemeService`. | **Minor** |
| `components/preferences-tab/preferences-tab.spec.ts` | -- | **Missing test for `onEmailDigestChange` with 'daily' frequency.** Tests cover 'none' and the default 'weekly' but only the radio click test switches to 'none'. No direct test for calling `onEmailDigestChange('daily')`. | **Minor** |

### Security

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `components/api-keys-tab/api-keys-tab.html` | 25 | **API secret displayed in plain text in DOM.** `{{ createdSecret() }}` renders the full API secret in a `<code>` element. While this is a one-time display by design, there is no mechanism to prevent it from lingering in browser devtools, extensions, or screen sharing. Consider masking by default with a reveal toggle. | **Suggestion** |

### Missing Functionality

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `components/settings-page/settings-page.ts` | -- | **No route guard on settings routes.** `settings.routes.ts` does not apply `authGuard` or `roleGuard`. Any unauthenticated user could navigate to `/settings` if the parent route does not enforce authentication. Should verify parent route config or add guards explicitly. | **Minor** |
| `components/theme-tab/theme-tab.ts` | -- | **Reduced motion and compact mode are stored but never applied.** `reducedMotion` and `compactMode` preferences are toggleable but no service or directive reads these values to actually reduce animations or adjust spacing in the application. | **Major** |
| `store/preferences.store.ts` | 10-17 | **Hardcoded default preferences.** `defaultEnvironmentId: 'env_development'` is a magic string. Should use a constant or be loaded from the backend/user preferences API. | **Minor** |

## What's Done Well

- **Signal-based state management is consistent.** All stores use the standard `private signal + public asReadonly()` pattern. Immutable updates via `.update()` and `.set()` are used correctly throughout.
- **OnPush change detection is applied on every component.** All five components correctly set `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Modern Angular control flow is used throughout.** Templates use `@if`, `@for`, `@switch` consistently. No legacy structural directives.
- **`inject()` function is used exclusively.** No constructor-based dependency injection anywhere in the module.
- **ApiKeyStore has excellent error handling.** All three async methods (`loadApiKeys`, `createApiKey`, `revokeApiKey`) have proper try/catch with toast notifications and signal-based error state.
- **ApiKeyApi is clean and focused.** Three well-typed methods (`getAll`, `create`, `revoke`) with proper use of `HttpClient` and the `API_BASE_URL` injection token.
- **API keys tab component is well-structured.** Manages create form, secret display, and revoke confirmation as distinct UI states with clean signal-based transitions.
- **Comprehensive test coverage.** All components and stores have thorough specs covering rendering, user interaction, state management, error handling, and edge cases (empty state, validation failures, null returns).
- **PreferencesStore correctly delegates theme changes to ThemeService.** The `updateThemePreferences()` method syncs mode changes to `ThemeService.setMode()`, and `activeThemeMode` is a computed that delegates to `ThemeService.activeTheme()`.
- **Good use of `const` arrays for options.** `API_KEY_SCOPE_OPTIONS` provides a typed, readonly options array for scope selection.
- **DataTable usage with UiColDirective.** The API keys table correctly uses the generic `ui-data-table` with column templates via `ng-template[uiCol]`.

## Recommended Fixes (Priority Order)

1. **[Blocker] Integrate UserProfile with AuthService.** Remove the hardcoded `UserProfile` from `user-profile.store.ts`. Instead, inject `AuthService` and derive profile information from `AuthService.userProfile()`. Either reuse the auth `UserProfile` model or create an adapter. The user-profile-tab should read from `AuthService`, not from a disconnected store with fake data.

2. **[Major] Remove or rework the password change form.** Since authentication is managed by Keycloak, the custom password form is non-functional and misleading. Either delegate password changes to Keycloak's account management page (via `keycloak.login({ action: 'UPDATE_PASSWORD' })`) or remove the form entirely and link to the Keycloak account console.

3. **[Major] Apply reduced motion and compact mode globally.** The preferences are stored but never consumed. Create a service or use `effect()` to apply `prefers-reduced-motion` styles and compact spacing CSS custom properties when these preferences are toggled.

4. **[Major] Fix SCSS BEM nesting in all five component stylesheets.** Replace all `&__element` nested selectors with full BEM class names (e.g., `.settings-page__content` instead of `&__content`). This affects `settings-page.scss`, `user-profile-tab.scss`, `preferences-tab.scss`, `theme-tab.scss`, and `api-keys-tab.scss`.

5. **[Major] Fix `profileName`/`profileEmail` signal initialization.** These signals capture a snapshot at construction time and will not react to external store changes. Either use `computed()` for read-only display or add an `effect()` to sync updates.

6. **[Major] Eliminate the duplicate UserProfile model.** Consolidate `settings.model.ts:UserProfile` with `core/auth/auth.models.ts:UserProfile`. The settings module should not define its own incompatible user profile shape.

7. **[Major] Add API persistence to UserProfileStore.** The `updateUserProfile()` method currently only updates local state. Create a `UserProfileApi` service to persist changes to the backend, following the pattern established by `ApiKeyStore`.

8. **[Minor] Remove unused `SettingsState` interface.** It is defined in the model file but never imported or referenced anywhere.

9. **[Minor] Validate tab IDs in `onTabChange`.** Add a type guard or validation to ensure the emitted tab ID is a valid `SettingsTab` value before setting the signal.

10. **[Minor] Replace `isScopeSelected()` method with a computed signal.** Convert the method-based template call to a `computed()` returning a `Set<ApiKeyScope>` for O(1) lookup in the template.

11. **[Suggestion] Consolidate repetitive input event handlers.** Extract the `(event.target as HTMLInputElement).value` pattern into a shared utility or use a single parameterized handler that accepts the target signal.

12. **[Suggestion] Add a reveal/hide toggle for the API secret display.** Instead of rendering the secret in plain text immediately, show it masked with a button to reveal, reducing accidental exposure.
