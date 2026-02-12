# Dependency Report - 2026-02-12

## Before

### Outdated Packages

No outdated packages detected.

### Security Audit

- Total vulnerabilities: 3
- Critical: 0 | High: 3 | Moderate: 0 | Low: 0

| Package | Severity | Issue | Fix Available |
|---------|----------|-------|---------------|
| `@isaacs/brace-expansion` 5.0.0 | High | [Uncontrolled Resource Consumption (ReDoS)](https://github.com/advisories/GHSA-7h2j-956f-4vf2) | Yes |
| `@modelcontextprotocol/sdk` 1.10.0–1.25.3 | High | [Cross-client data leak via shared server/transport instance reuse](https://github.com/advisories/GHSA-345p-7cg4-v4c7) | Yes |
| `@angular/cli` (transitive via `@modelcontextprotocol/sdk`) | High | Depends on vulnerable `@modelcontextprotocol/sdk` | Yes |

## Decisions

| Action | Package(s) | Rationale |
|--------|-----------|-----------|
| Fixed | `@isaacs/brace-expansion` | High severity ReDoS — fix available within semver range |
| Fixed | `@modelcontextprotocol/sdk` | High severity data leak — fix available within semver range |
| Fixed | `@angular/cli` (transitive) | Resolved by fixing `@modelcontextprotocol/sdk` dependency |

All fixes applied via `npm audit fix`. Only `package-lock.json` was modified (no `package.json` changes), confirming all fixes were within semver-compatible ranges. All packages are devDependencies only — no production risk.

## After

### Outdated Packages

No outdated packages detected.

### Security Audit

- Total vulnerabilities: 0
- Critical: 0 | High: 0 | Moderate: 0 | Low: 0

## Summary

- Outdated: 0 → 0 (no change)
- Vulnerabilities: 3 → 0 (3 resolved)
- Tests: 1242/1242 passing (all green)
- Files changed: `package-lock.json` only (+154/-38 lines)
