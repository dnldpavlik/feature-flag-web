# Dependency Report - 2026-02-19

## Before

### Outdated Packages

No outdated packages found.

### Security Audit

- Total vulnerabilities: 44
- Critical: 0 | High: 37 | Moderate: 7 | Low: 0

| Root Vulnerability | Severity | Issue | Fix Available | Packages Affected |
|---|---|---|---|---|
| `ajv` < 8.18.0 | moderate | ReDoS with `$data` option ([GHSA-2g4f-4pwh-qvx6](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6)) | No | 7 (Angular CLI, ESLint) |
| `minimatch` < 10.2.1 | high | ReDoS via repeated wildcards ([GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26)) | Breaking only | 36 (ESLint, Jest, typescript-eslint) |
| `tar` < 7.5.8 | high | Arbitrary file read/write via hardlink/symlink ([GHSA-83g3-92jg-28cx](https://github.com/advisories/GHSA-83g3-92jg-28cx)) | Yes | 1 |

**Note:** All 44 vulnerabilities are in dev dependencies only. No production dependencies are affected.

## Decisions

| Action | Package(s) | Rationale |
|---|---|---|
| Fixed | `tar` (updated to >=7.5.8) | Safe non-breaking fix via `npm audit fix`. Resolves arbitrary file read/write vulnerability. |
| Excepted | `ajv` < 8.18.0 | Dev-only dependency (Angular CLI, ESLint). No upstream fix available. Added to `.nsprc`. |
| Excepted | `minimatch` < 10.2.1 | Dev-only dependency (ESLint, Jest, typescript-eslint). Only fix requires Jest downgrade to v25 (breaking). Added to `.nsprc`. |

## After

### Outdated Packages

No outdated packages found.

### Security Audit

- Total vulnerabilities: 43
- Critical: 0 | High: 36 | Moderate: 7 | Low: 0

| Root Vulnerability | Severity | Status |
|---|---|---|
| `ajv` < 8.18.0 | moderate | Excepted in `.nsprc` — awaiting upstream fix |
| `minimatch` < 10.2.1 | high | Excepted in `.nsprc` — awaiting upstream fix |

### Production Audit (better-npm-audit)

```
0 vulnerabilities found (--production)
```

## Summary

- Outdated: 0 → 0 (none)
- Vulnerabilities: 44 → 43 (1 resolved: `tar`)
- Remaining: 43 dev-only vulnerabilities with no safe fix (excepted via `.nsprc`)
- Production audit: Clean (0 vulnerabilities)
- Tests: 1258 passing, 100% coverage
