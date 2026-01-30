# Security Scanning with Snyk

This document describes the security scanning setup for the Feature Flags Web UI project.

## Overview

The project uses [Snyk](https://snyk.io) for comprehensive security scanning:

| Scan Type | What It Checks | Tool |
|-----------|----------------|------|
| **SCA** (Software Composition Analysis) | npm dependency vulnerabilities | `snyk test` |
| **SAST** (Static Application Security Testing) | Source code security issues | `snyk code test` |
| **Container** | Docker image vulnerabilities | `snyk container test` |
| **IaC** | Dockerfile/docker-compose misconfigurations | `snyk iac test` |

## Setup Instructions

### 1. Create Snyk Account & Token

1. Sign up at [snyk.io](https://snyk.io) (free tier available)
2. Go to **Account Settings** → **General** → **Auth Token**
3. Copy your API token

### 2. Add CI/CD Variable in GitLab

1. Navigate to your project: **Settings** → **CI/CD** → **Variables**
2. Add a new variable:
   - **Key:** `SNYK_TOKEN`
   - **Value:** Your Snyk API token
   - **Type:** Variable
   - **Flags:** ✅ Mask variable, ✅ Protect variable

### 3. Create Pipeline Schedule

1. Navigate to **Build** → **Pipeline schedules**
2. Click **New schedule**
3. Configure:
   - **Description:** Weekly Snyk Security Scan
   - **Interval Pattern:** `0 6 * * 1` (Mondays at 6:00 AM UTC)
   - **Cron Timezone:** Select your timezone
   - **Target branch:** `main`
4. Add variable:
   - **Key:** `SCHEDULED_SECURITY_SCAN`
   - **Value:** `true`
5. Click **Save pipeline schedule**

## Pipeline Structure

```
.gitlab-ci.yml                 # Main pipeline config
└── include:
    └── .gitlab/ci/snyk.yml    # Snyk security jobs
```

### Jobs in `.gitlab/ci/snyk.yml`

| Job | Description | Runs On |
|-----|-------------|---------|
| `snyk-dependency-scan` | Scans `package-lock.json` for vulnerable packages | Schedule, MRs |
| `snyk-code-scan` | Static analysis of TypeScript/JavaScript code | Schedule |
| `snyk-container-scan` | Scans built Docker image | Schedule |
| `snyk-iac-scan` | Checks Dockerfile and compose files | Schedule |
| `security-report-summary` | Aggregates and summarizes all scan results | Schedule |

## Scan Triggers

| Trigger | What Runs |
|---------|-----------|
| Weekly schedule | All Snyk scans (SCA, SAST, Container, IaC) |
| Merge request to main | Dependency scan only (non-blocking) |
| Push to main | npm audit (quick check) |

## Severity Thresholds

Current configuration:

| Scan Type | Threshold | Behavior |
|-----------|-----------|----------|
| Dependencies | `medium` | Report all medium+ vulnerabilities |
| Code (SAST) | `high` | Report high+ issues |
| Container | `high` | Report high+ vulnerabilities |
| IaC | `medium` | Report medium+ misconfigurations |

To change thresholds, edit `.gitlab/ci/snyk.yml` and modify the `--severity-threshold` flags.

## Viewing Results

### Snyk Dashboard

Results from `snyk monitor` are pushed to your Snyk dashboard:
- [app.snyk.io](https://app.snyk.io)
- View trends over time
- Set up Slack/email notifications

### GitLab Artifacts

Each scan produces JSON artifacts downloadable from the pipeline:
- `snyk-dependency-results.json`
- `snyk-code-results.json`
- `snyk-container-results.json`
- `snyk-iac-results.json`

Artifacts are retained for 30 days.

### GitLab Security Dashboard

Dependency and container scan results integrate with GitLab's Security Dashboard (if available on your GitLab tier).

## Ignoring Vulnerabilities

To ignore a specific vulnerability (use sparingly, with justification):

1. Edit the `.snyk` file in the project root
2. Add an ignore rule:

```yaml
ignore:
  SNYK-JS-EXAMPLE-1234567:
    - '*':
        reason: 'No upgrade path available, mitigated by XYZ'
        expires: '2025-06-01T00:00:00.000Z'
        created: '2025-02-01T00:00:00.000Z'
```

Always set an expiry date to force periodic re-evaluation.

## Manual Scanning

Run scans locally during development:

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Dependency scan
snyk test

# Code scan (SAST)
snyk code test

# Container scan (requires Docker)
docker build -t feature-flags-web .
snyk container test feature-flags-web --file=Dockerfile

# IaC scan
snyk iac test
```

## Enforcing Security Gates

Currently, security scans are configured as non-blocking (`allow_failure: true`). To enforce security gates:

1. In `.gitlab/ci/snyk.yml`, remove `allow_failure: true` from desired jobs
2. Uncomment the exit code check in `snyk-dependency-scan`:

```yaml
- |
  if [ "$SNYK_EXIT_CODE" -ne 0 ]; then
    echo "⚠️  Vulnerabilities found"
    exit $SNYK_EXIT_CODE  # Uncomment to fail the pipeline
  fi
```

## Troubleshooting

### "Authentication failed"
- Verify `SNYK_TOKEN` is set correctly in CI/CD variables
- Ensure the variable is not protected if running on non-protected branches

### "Container image not found"
- The `snyk-container-scan` job requires `build-image` to run first
- Ensure the image was pushed to the registry

### Scans timing out
- Large projects may need increased timeout
- Consider using `--prune-repeated-subdependencies` for dependency scans

## Additional Resources

- [Snyk CLI Documentation](https://docs.snyk.io/snyk-cli)
- [GitLab CI/CD Snyk Integration](https://docs.snyk.io/integrations/ci-cd-integrations/gitlab-ci-cd-integration)
- [Snyk for JavaScript/TypeScript](https://docs.snyk.io/scan-applications/supported-languages-and-frameworks/javascript)
