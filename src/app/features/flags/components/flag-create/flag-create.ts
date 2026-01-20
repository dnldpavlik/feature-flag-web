import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { FlagType } from '../../models/flag.model';
import { FlagStore } from '../../store/flag.store';

@Component({
  selector: 'app-flag-create',
  standalone: true,
  imports: [ButtonComponent, FormsModule],
  templateUrl: './flag-create.html',
  styleUrl: './flag-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagCreateComponent {
  private readonly store = inject(FlagStore);
  private readonly router = inject(Router);

  protected name = '';
  protected key = '';
  protected description = '';
  protected type: FlagType = 'boolean';
  protected enabled = true;
  protected tags = '';

  protected createFlag(): void {
    const trimmedName = this.name.trim();
    const resolvedKey = this.key.trim() || this.toKey(trimmedName);
    const resolvedTags = this.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (!trimmedName || !resolvedKey) {
      return;
    }

    this.store.addFlag({
      key: resolvedKey,
      name: trimmedName,
      description: this.description.trim(),
      type: this.type,
      enabled: this.enabled,
      tags: resolvedTags,
    });

    void this.router.navigate(['/flags']);
  }

  protected cancel(): void {
    void this.router.navigate(['/flags']);
  }

  private toKey(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
