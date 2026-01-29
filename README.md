# Feature Flag UI

A modern Angular 21 web application for managing feature flags, inspired by LaunchDarkly. This application provides a comprehensive interface for creating, managing, and monitoring feature flags across multiple projects and environments.

## Overview

Feature Flag UI connects to a Rust backend API to provide teams with powerful feature flag management capabilities:

- Create and manage feature flags with multiple variation types
- Define complex targeting rules for gradual rollouts
- Organize flags by projects and environments
- Monitor flag usage through analytics dashboards
- Track all changes via comprehensive audit logs

## Tech Stack

- **Framework**: Angular 21
- **Language**: TypeScript 5.x
- **State Management**: Angular Signals
- **Styling**: SCSS with BEM methodology
- **Testing**: Jest + Angular Testing Library + Playwright
- **Build**: Angular CLI with esbuild
- **Container**: Docker + DevContainer

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker Desktop (for DevContainer)
- VS Code with DevContainers extension (recommended)

## Getting Started

### Option 1: DevContainer (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/feature-flag-ui.git
   cd feature-flag-ui
   ```

2. Open in VS Code:
   ```bash
   code .
   ```

3. When prompted, click "Reopen in Container" or run the command:
   - Press `F1` → "Dev Containers: Reopen in Container"

4. Wait for the container to build and dependencies to install.

5. Start the development server:
   ```bash
   npm start
   ```

6. Open http://localhost:4200 in your browser.

### Option 2: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/feature-flag-ui.git
   cd feature-flag-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   # Edit environment.ts with your API URL
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open http://localhost:4200 in your browser.

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 4200 |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run e2e` | Run Playwright E2E tests |
| `npm run lint` | Check for linting issues |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run build` | Production build |
| `npm run build:analyze` | Production build with bundle analysis |
| `npm run typecheck` | TypeScript type checking |

### Project Structure

```
src/
├── app/
│   ├── core/                 # Singleton services, guards, interceptors
│   │   ├── api/              # API client services
│   │   ├── auth/             # Authentication services
│   │   ├── config/           # App configuration
│   │   └── error-handling/   # Global error handling
│   ├── shared/               # Shared utilities and components
│   │   ├── ui/               # Reusable UI components
│   │   ├── utils/            # Pure utility functions
│   │   ├── pipes/            # Custom pipes
│   │   └── directives/       # Custom directives
│   ├── features/             # Feature modules (lazy-loaded)
│   │   ├── dashboard/
│   │   ├── flags/
│   │   ├── projects/
│   │   ├── environments/
│   │   ├── segments/
│   │   ├── analytics/
│   │   └── audit-log/
│   ├── layout/               # App shell (header, sidebar, footer)
│   └── app.routes.ts         # Root routing configuration
├── styles/                   # Global SCSS files
├── environments/             # Environment configurations
└── assets/                   # Static assets
```

### Coding Standards

This project follows strict development practices:

**Test-Driven Development (TDD)**
- Write failing tests before implementation
- Maintain minimum 80% code coverage
- See [CLAUDE.md](./.claude/CLAUDE.md) for detailed TDD workflow

**SOLID Principles**
- Single Responsibility: One reason to change per class/function
- Open/Closed: Extend via composition, not modification
- Liskov Substitution: Implementations are interchangeable
- Interface Segregation: Small, focused interfaces
- Dependency Inversion: Depend on abstractions

**Functional Programming**
- Pure functions for data transformations
- Immutable state updates
- Function composition over inheritance

**Angular Best Practices**
- Standalone components only (no NgModules)
- Signals for state management
- `inject()` function for DI
- New control flow syntax (`@if`, `@for`, `@defer`)
- OnPush change detection

### Testing

**Unit Tests** (Jest + Angular Testing Library)
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**E2E Tests** (Playwright)
```bash
# Run smoke tests (fast, ~15s)
npm run e2e:smoke

# Run user journey tests
npm run e2e:journeys

# Run full regression suite
npm run e2e:regression

# Interactive UI mode
npm run e2e:ui

# Debug mode
npm run e2e:debug
```

See [e2e/README.md](./e2e/README.md) for the complete E2E testing guide.

### API Configuration

Configure the Rust backend API URL in your environment file:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  // ... other config
};
```

## Architecture

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

Key architectural decisions:

- **Signal-based stores**: Each feature has its own store using Angular Signals
- **Typed API clients**: Strongly typed interfaces matching Rust API contracts
- **Lazy loading**: Feature modules loaded on demand
- **Smart/Dumb components**: Container components handle logic, presentational components are pure

## Features

See [FEATURES.md](./docs/FEATURES.md) for detailed feature specifications.

Core features include:

- Dashboard with activity feed and quick actions
- Full flag CRUD with variation management
- Visual targeting rules builder
- Project and environment management
- User segments for reusable targeting
- Analytics dashboard
- Comprehensive audit logging

## Contributing

1. Create a feature branch from `main`
2. Write tests first (TDD)
3. Implement the feature
4. Ensure all tests pass and coverage is maintained
5. Run linting and formatting
6. Submit a pull request

### Commit Convention

This project uses conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `docs:` Documentation updates
- `chore:` Maintenance tasks
- `style:` Formatting changes

Example:
```
feat(flags): add bulk toggle functionality

- Add bulk selection UI
- Implement batch toggle API call
- Add confirmation dialog
- Update tests
```

## Troubleshooting

### Common Issues

**Port 4200 already in use**
```bash
# Find and kill the process
lsof -ti:4200 | xargs kill -9
# Or use a different port
npm start -- --port 4201
```

**DevContainer not starting**
- Ensure Docker Desktop is running
- Try rebuilding: F1 → "Dev Containers: Rebuild Container"

**Tests failing with module not found**
```bash
# Clear Jest cache
npm run test -- --clearCache
```

**Type errors after pulling changes**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## Documentation

- [CLAUDE.md](./.claude/CLAUDE.md) - AI coding assistant instructions
- [e2e/README.md](./e2e/README.md) - E2E testing guide
- [docs/SECURITY.md](./docs/SECURITY.md) - Security guidelines and requirements
- [docs/DESIGN.md](./docs/DESIGN.md) - Design document
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Architecture documentation
- [docs/FEATURES.md](./docs/FEATURES.md) - Feature specifications
- [TODO.md](./TODO.md) - Development task tracker

## License

[MIT License](./LICENSE)

## Support

For issues and feature requests, please use the GitHub issue tracker.
