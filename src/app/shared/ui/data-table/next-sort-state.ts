import type { SortState } from './sort-state.interface';

export function nextSortState(prev: SortState | null, key: string): SortState {
  if (prev && prev.key === key) {
    return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
  }
  return { key, dir: 'asc' };
}
