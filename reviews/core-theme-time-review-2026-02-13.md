# Module Review: core/theme + core/time — 2026-02-13

## Module Summary
- **Path:** `src/app/core/theme/`, `src/app/core/time/`
- **Purpose:** ThemeService (light/dark/system mode with persistence), TimeService (testable time abstraction)
- **File Count:** 4 production files, 2 test files
- **Test Coverage:** 2/2 testable files have specs (100%)

---

## Issues Found

### Framework Best Practices
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| theme.service.ts | 104 | Media query event listener is never cleaned up (no `removeEventListener`). Acceptable for root singleton, but `DestroyRef` + `takeUntilDestroyed` pattern would be more robust | Suggestion |

---

## What's Done Well
- **ThemeService:** Exemplary signals-based architecture — private `_mode` + `_systemPrefersDark`, public `mode`, `activeTheme`, `isDark` computed signals
- System preference listener correctly tracks OS dark mode changes
- `loadMode()` validates localStorage value against allowed union members — prevents corrupted state
- Graceful fallbacks when localStorage or matchMedia unavailable (SSR-safe)
- `toggle()` intelligently handles 'system' mode by flipping from current resolved theme
- Effect auto-applies `data-theme` attribute to document root
- **TimeService:** Clean `TimeProvider` interface enables DI-based testing
- `createControllableTimeProvider` with `advance()`, `setTime()`, `getCalls()` is excellent for store tests
- Both modules have thorough tests including edge cases (missing APIs, undefined fields, combined operations)
- Barrel file uses proper `export type {}` syntax

---

## Recommended Fixes (Priority Order)
1. **Suggestion:** Consider registering the media query listener cleanup via `DestroyRef` for consistency with Angular patterns (low priority since root singleton)
