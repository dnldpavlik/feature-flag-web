# Skill: Angular Component Generator

## Purpose
Generate Angular 21 standalone components following this project's exact conventions.

## When to Use
- Creating new feature components
- Creating new shared UI components
- Adding components to existing features

## Conventions

### File Structure
For a component named `flag-card`:
```
flag-card/
  flag-card.ts        # Component class
  flag-card.html      # Template
  flag-card.scss      # Styles (BEM)
  flag-card.spec.ts   # Tests (written FIRST)
```

No `.component` suffix in filenames.

### Component Template

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-{name}',
  imports: [],
  templateUrl: './{name}.html',
  styleUrl: './{name}.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class {Name}Component {
  // Required inputs first
  readonly data = input.required<DataType>();

  // Optional inputs with defaults
  readonly variant = input<string>('default');

  // Outputs
  readonly clicked = output<void>();

  // Injected dependencies
  private readonly store = inject(SomeStore);

  // Computed signals for derived state
  protected readonly displayName = computed(() => this.data().name.toUpperCase());

  // Protected methods for template
  protected onAction(): void {
    this.clicked.emit();
  }
}
```

### Rules
1. Do NOT set `standalone: true` (Angular 21 default)
2. Always set `changeDetection: ChangeDetectionStrategy.OnPush`
3. Use `input()` / `output()` functions, never decorators
4. Use `inject()` for DI, never constructor injection
5. Use `host: {}` for host bindings, never `@HostBinding`
6. Use `@if`/`@for`/`@switch` in templates, never `*ngIf`/`*ngFor`
7. Mark template-only methods as `protected`
8. Mark injected deps as `private readonly`

### Test Template (Write First)

```typescript
import { render, screen } from '@testing-library/angular';
import { {Name}Component } from './{name}';

describe('{Name}Component', () => {
  async function setup(overrides = {}) {
    return render({Name}Component, {
      inputs: { data: createMockData(), ...overrides },
    });
  }

  it('should render', async () => {
    await setup();
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```

### SCSS Template (BEM)

```scss
:host {
  display: block;
}

.{name} {
  // Block styles

  &__element {
    // Element styles
  }

  &--modifier {
    // Modifier styles
  }
}
```

Use CSS custom properties from `_variables.scss`:
- Colors: `var(--text-primary)`, `var(--bg-card)`, `var(--accent-primary)`
- Spacing: `var(--border-radius)`, `var(--border-radius-lg)`
- Effects: `var(--shadow-sm)`, `var(--transition-fast)`
