import type { SortState } from './sort-state.interface';
import type { ColLike } from './col-like.interface';
import { defaultAccessor } from './default-accessor';
import { defaultCompare } from './default-compare';

export function sortRows<T>(rows: readonly T[], state: SortState | null, cols: readonly ColLike<T>[]): T[] {
  if (!state) return [...rows];
  const col = cols.find(c => c.key() === state.key);
  if (!col || col.sortable() === false) return [...rows];
  const accessor = col.sortAccessor() ?? ((row: T) => defaultAccessor(row, state.key));
  const compare = col.sortCompare() ?? defaultCompare;
  const copy = [...rows];
  copy.sort((a, b) => compare(accessor(a), accessor(b)));
  return state.dir === 'desc' ? copy.reverse() : copy;
}
