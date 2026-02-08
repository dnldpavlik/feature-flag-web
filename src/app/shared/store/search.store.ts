import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchStore {
  private readonly querySignal = signal('');
  readonly query = this.querySignal.asReadonly();
  readonly normalizedQuery = computed(() => this.querySignal().trim().toLowerCase());

  setQuery(value: string): void {
    this.querySignal.set(value);
  }

  clear(): void {
    this.querySignal.set('');
  }
}
