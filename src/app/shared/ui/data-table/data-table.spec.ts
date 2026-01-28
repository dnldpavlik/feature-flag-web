import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { DataTableComponent } from '@/app/shared/ui/data-table/data-table';
import { UiColDirective } from '@/app/shared/ui/data-table/ui-col.directive';
import { SortState } from '@/app/shared/ui/data-table/sort-state.interface';
import { defaultCompare } from '@/app/shared/ui/data-table/default-compare';

interface Row { id: number; name: string; qty?: number; price: number; }

@Component({
  selector: 'app-test-host',
  imports: [DataTableComponent, UiColDirective],
  template: `
    <app-ui-data-table
      [items]="rows()"
      [initialSort]="initial"
      (sortChange)="onSort($event)"
      ariaLabel="Inventory"
    >
      <ng-template appUiCol="name" header="Name" let-r>{{ r.name }}</ng-template>
      <ng-template appUiCol="qty" header="Qty" align="right" let-r>{{ r.qty }}</ng-template>
      <ng-template appUiCol="price" header="Price" align="right" [sortable]="true" [sortAccessor]="priceAccessor" [sortCompare]="inverseCompare" let-r>{{ r.price }}</ng-template>
      <ng-template appUiCol="unsortable" header="Static" [sortable]="false" let-r>•</ng-template>
    </app-ui-data-table>
  `
})
class HostComponent {
  initial: SortState | null = { key: 'qty', dir: 'desc' };
  rows = signal<Row[]>([
    { id: 1, name: 'A', qty: 5, price: 2.5 },
    { id: 2, name: 'B', qty: 10, price: 1.0 },
    { id: 3, name: 'C', qty: 7, price: 3.0 },
  ]);
  sortEvents: SortState[] = [];
  priceAccessor = (r: Row) => r.price;
  inverseCompare = (a: unknown, b: unknown) => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
  };
  onSort(s: SortState | null) {
    if (s) this.sortEvents.push(s);
  }
}

const getCellTexts = (fixture: ComponentFixture<HostComponent>, colIndex: number) =>
  Array.from(fixture.nativeElement.querySelectorAll(`.data-table__body-wrap .data-table__body tbody tr td:nth-child(${colIndex})`))
    .map((td: Element) => (td as HTMLElement).textContent?.trim() ?? '');

describe('DataTableComponent Specification', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialisation', () => {
    it('applies initial validated sort only once', () => {
      expect(getCellTexts(fixture, 2)).toEqual(['10', '7', '5']); // qty desc
      const qtyHeader = fixture.nativeElement.querySelector('.data-table--head th:nth-child(2)');
      expect(qtyHeader.getAttribute('aria-sort')).toBe('desc');
    });

    it('ignores initial sort if column key invalid', () => {
      host.initial = { key: 'unknown', dir: 'asc' };
      fixture.detectChanges();
      expect(getCellTexts(fixture, 2)).toEqual(['5', '10', '7']);
    });

    it('ignores initial sort if column is not sortable', () => {
      host.initial = { key: 'unsortable', dir: 'asc' };
      fixture.detectChanges();
      expect(getCellTexts(fixture, 2)).toEqual(['5', '10', '7']);
    });
  });

  describe('User Interaction', () => {
    it('toggles sort direction on repeated header clicks', () => {
      const qtyHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(2)');
      qtyHeader.click(); // desc -> asc
      fixture.detectChanges();
      expect(qtyHeader.getAttribute('aria-sort')).toBe('asc');
      expect(getCellTexts(fixture, 2)).toEqual(['5', '7', '10']);
      qtyHeader.click(); // asc -> desc
      fixture.detectChanges();
      expect(qtyHeader.getAttribute('aria-sort')).toBe('desc');
      expect(getCellTexts(fixture, 2)).toEqual(['10', '7', '5']);
    });

    it('supports keyboard Enter/Space to trigger sort', () => {
      const qtyHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(2)');
      qtyHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();
      expect(qtyHeader.getAttribute('aria-sort')).toBe('asc');
      qtyHeader.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      fixture.detectChanges();
      expect(qtyHeader.getAttribute('aria-sort')).toBe('desc');
    });

    it('does not sort when clicking unsortable column', () => {
      const staticHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(4)');
      staticHeader.click();
      fixture.detectChanges();
      expect(getCellTexts(fixture, 2)).toEqual(['10', '7', '5']);
    });
  });

  describe('Custom Sorting', () => {
    it('uses custom accessor + comparator (price column)', () => {
      const priceHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(3)');
      priceHeader.click();
      fixture.detectChanges();
      expect(priceHeader.getAttribute('aria-sort')).toBe('asc');
      expect(getCellTexts(fixture, 3)).toEqual(['3', '2.5', '1']);
      priceHeader.click();
      fixture.detectChanges();
      expect(priceHeader.getAttribute('aria-sort')).toBe('desc');
      expect(getCellTexts(fixture, 3)).toEqual(['1', '2.5', '3']);
    });
  });

  describe('Events', () => {
    it('emits sortChange only on user actions (not initial)', () => {
      expect(host.sortEvents.length).toBe(0);
      const qtyHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(2)');
      qtyHeader.click();
      fixture.detectChanges();
      qtyHeader.click();
      fixture.detectChanges();
      expect(host.sortEvents.map(e => e.dir)).toEqual(['asc', 'desc']);
    });
  });

  describe('Default Accessor and Edge Cases', () => {
    it('sorts by name using default accessor and comparator', () => {
      const nameHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(1)');
      nameHeader.click();
      fixture.detectChanges();
      expect(nameHeader.getAttribute('aria-sort')).toBe('asc');
      expect(getCellTexts(fixture, 1)).toEqual(['A', 'B', 'C']);
      nameHeader.click();
      fixture.detectChanges();
      expect(nameHeader.getAttribute('aria-sort')).toBe('desc');
      expect(getCellTexts(fixture, 1)).toEqual(['C', 'B', 'A']);
    });

    it('handles undefined values with defaultCompare (undefined first on asc)', () => {
      host.rows.update(r => [...r, { id: 4, name: 'D', price: 4.0 } as Row]);
      fixture.detectChanges();

      const qtyHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(2)');
      qtyHeader.click(); // desc -> asc
      fixture.detectChanges();
      const qtyAsc = getCellTexts(fixture, 2);
      expect(qtyAsc[0]).toBe('');
      qtyHeader.click();
      fixture.detectChanges();
      const qtyDesc = getCellTexts(fixture, 2);
      expect(qtyDesc[qtyDesc.length - 1]).toBe('');
    });

    it('exposes header classes for sortable and sorted states', () => {
      const nameHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(1)');
      const qtyHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(2)');
      const staticHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(4)');
      expect(qtyHeader.classList.contains('data-table__header--sortable')).toBe(true);
      expect(staticHeader.classList.contains('data-table__header--sortable')).toBe(false);
      expect(qtyHeader.classList.contains('data-table__header--sorted')).toBe(true);
      expect(nameHeader.getAttribute('aria-sort')).toBe('none');

      nameHeader.click();
      fixture.detectChanges();
      expect(nameHeader.classList.contains('data-table__header--sorted')).toBe(true);
      expect(qtyHeader.classList.contains('data-table__header--sorted')).toBe(false);
    });

    it('sort indicator text shows arrow for direction', () => {
      const qtyHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(2)');
      let indicator = qtyHeader.querySelector('.data-table__sort-indicator') as HTMLElement;
      expect(indicator?.textContent?.trim()).toBe('▼');
      qtyHeader.click();
      fixture.detectChanges();
      indicator = qtyHeader.querySelector('.data-table__sort-indicator') as HTMLElement;
      expect(indicator?.textContent?.trim()).toBe('▲');
    });

    it('does not emit sortChange when clicking an unsortable header', () => {
      const staticHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(4)');
      const before = host.sortEvents.length;
      staticHeader.click();
      fixture.detectChanges();
      expect(host.sortEvents.length).toBe(before);
    });

    it('reacts to data changes by re-applying active sort', () => {
      host.rows.set([
        { id: 1, name: 'A', qty: 100, price: 2.5 },
        { id: 2, name: 'B', qty: 10, price: 1.0 },
        { id: 3, name: 'C', qty: 7, price: 3.0 },
      ]);
      fixture.detectChanges();
      expect(getCellTexts(fixture, 1)[0]).toBe('A');
      expect(getCellTexts(fixture, 2)[0]).toBe('100');
    });

    it('returns empty sortSymbol for an unsorted column', () => {
      const tableDe = fixture.debugElement.query(By.directive(DataTableComponent));
      const tableCmp = tableDe.componentInstance as DataTableComponent<Row>;
      const cols = tableCmp.cols();
      const nameCol = cols.find(c => c.key() === 'name')!;
      expect(tableCmp.sortDirection(nameCol)).toBeNull();
      expect(tableCmp.sortSymbol(nameCol)).toBe('');
    });

    it('trackRow falls back to row then index when id missing', () => {
      const tableDe = fixture.debugElement.query(By.directive(DataTableComponent));
      const tableCmp = tableDe.componentInstance as DataTableComponent<Row>;
      const rowNoId = { name: 'X' } as Row;
      expect(tableCmp.trackRow(7, rowNoId)).toBe(rowNoId);
      expect(tableCmp.trackRow(8, undefined as unknown as Row)).toBe(8);
    });

    it('handles internal invalid sort state gracefully (reverts to input order)', () => {
      const tableDe = fixture.debugElement.query(By.directive(DataTableComponent));
      const tableCmp = tableDe.componentInstance as DataTableComponent<Row>;
      (tableCmp as unknown as { userSort: { set: (v: SortState) => void } }).userSort.set({ key: 'does-not-exist', dir: 'asc' });
      fixture.detectChanges();
      expect(getCellTexts(fixture, 2)).toEqual(['5', '10', '7']);
    });

    it('covers equality branch in defaultCompare (stable on equal values)', () => {
      host.rows.set([
        { id: 1, name: 'A', qty: 5, price: 2.5 },
        { id: 2, name: 'A', qty: 10, price: 1.0 },
        { id: 3, name: 'C', qty: 7, price: 3.0 },
      ]);
      fixture.detectChanges();
      const nameHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(1)');
      nameHeader.click();
      fixture.detectChanges();
      const names = getCellTexts(fixture, 1);
      expect(names.slice(0, 2)).toEqual(['A', 'A']);
    });
  });
});

@Component({
  selector: 'app-test-host-no-init',
  imports: [DataTableComponent, UiColDirective],
  template: `
    <app-ui-data-table [items]="rows">
      <ng-template appUiCol="name" header="Name" let-r>{{ r.name }}</ng-template>
      <ng-template appUiCol="qty" header="Qty" align="right" let-r>{{ r.qty }}</ng-template>
    </app-ui-data-table>
  `
})
class HostNoInitialComponent {
  rows: Row[] = [
    { id: 1, name: 'A', qty: 5, price: 0 },
    { id: 2, name: 'B', qty: 10, price: 0 },
  ];
}

describe('DataTable without initial sort', () => {
  let fixture: ComponentFixture<HostNoInitialComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostNoInitialComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostNoInitialComponent);
    fixture.detectChanges();
  });
  it('renders headers with aria-sort="none" initially', () => {
    const nameHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(1)');
    const qtyHeader: HTMLTableCellElement = fixture.nativeElement.querySelector('.data-table--head th:nth-child(2)');
    expect(nameHeader.getAttribute('aria-sort')).toBe('none');
    expect(qtyHeader.getAttribute('aria-sort')).toBe('none');
  });
});

@Component({
  selector: 'app-test-host-null-items',
  imports: [DataTableComponent, UiColDirective],
  template: `
    <app-ui-data-table [items]="rows()">
      <ng-template appUiCol="name" header="Name" let-r>{{ r.name }}</ng-template>
    </app-ui-data-table>
  `
})
class HostNullItemsComponent {
  rows = signal<Row[] | null>(null);
}

describe('DataTable with null items', () => {
  let fixture: ComponentFixture<HostNullItemsComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostNullItemsComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostNullItemsComponent);
    fixture.detectChanges();
  });
  it('treats null items as empty array', () => {
    const empty = fixture.nativeElement.querySelector('.data-table__empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent.trim()).toBe('No rows.');
  });
});

describe('defaultCompare', () => {
  it('returns 0 when both values are null', () => {
    expect(defaultCompare(null, null)).toBe(0);
  });

  it('returns 0 when both values are undefined', () => {
    expect(defaultCompare(undefined, undefined)).toBe(0);
  });

  it('returns -1 when only a is null', () => {
    expect(defaultCompare(null, 1)).toBe(-1);
  });

  it('returns 1 when only b is null', () => {
    expect(defaultCompare(1, null)).toBe(1);
  });
});
