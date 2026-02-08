import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { BreadcrumbComponent, BreadcrumbItem } from './breadcrumb';

describe('Breadcrumb', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;

  const mockItems: BreadcrumbItem[] = [
    {
      label: 'Project',
      key: 'project',
      selectOptions: [
        { id: 'proj_default', label: 'Default Project' },
        { id: 'proj_growth', label: 'Growth Experiments' },
      ],
      selectedId: 'proj_default',
    },
    { label: 'Projects', route: '/projects' },
    { label: 'Feature Flags' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render the container with breadcrumb class', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.breadcrumb'));
      expect(container).toBeTruthy();
    });

    it('should render all breadcrumb items', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.breadcrumb__item'));
      expect(items.length).toBe(3);
    });

    it('should render item labels', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.breadcrumb__item'));
      expect(items[0].nativeElement.textContent).toContain('Default Project');
      expect(items[1].nativeElement.textContent).toContain('Projects');
      expect(items[2].nativeElement.textContent).toContain('Feature Flags');
    });
  });

  describe('separators', () => {
    it('should render separators between items', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const separators = fixture.debugElement.queryAll(By.css('.breadcrumb__separator'));
      expect(separators.length).toBe(2); // n-1 separators for n items
    });

    it('should use chevron-right icon as separator', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const separators = fixture.debugElement.queryAll(By.css('.breadcrumb__separator app-icon'));
      expect(separators.length).toBe(2);
    });
  });

  describe('links', () => {
    it('should render links for items with routes', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const links = fixture.debugElement.queryAll(By.css('.breadcrumb__link'));
      expect(links.length).toBe(1);
    });

    it('should not render link for item without route', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const lastItem = fixture.debugElement.queryAll(By.css('.breadcrumb__item')).pop();
      const link = lastItem?.query(By.css('.breadcrumb__link'));
      expect(link).toBeFalsy();
    });

    it('should render span for current item (no route)', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const currentItem = fixture.debugElement.query(By.css('.breadcrumb__current'));
      expect(currentItem).toBeTruthy();
      expect(currentItem.nativeElement.textContent).toContain('Feature Flags');
    });
  });

  describe('current item styling', () => {
    it('should mark last item as current', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.breadcrumb__item'));
      const lastItem = items[items.length - 1];
      expect(lastItem.nativeElement.classList.contains('breadcrumb__item--current')).toBe(true);
    });

    it('should not mark other items as current', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.breadcrumb__item'));
      expect(items[0].nativeElement.classList.contains('breadcrumb__item--current')).toBe(false);
      expect(items[1].nativeElement.classList.contains('breadcrumb__item--current')).toBe(false);
    });
  });

  describe('single item', () => {
    it('should render single item without separator', () => {
      fixture.componentRef.setInput('items', [{ label: 'Dashboard' }]);
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.breadcrumb__item'));
      const separators = fixture.debugElement.queryAll(By.css('.breadcrumb__separator'));

      expect(items.length).toBe(1);
      expect(separators.length).toBe(0);
    });
  });

  describe('select items', () => {
    it('should render a select control', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('.breadcrumb__select'));
      expect(select).toBeTruthy();
    });

    it('should emit when selection changes', () => {
      const spy = jest.fn();
      component.selectionChange.subscribe(spy);
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('.breadcrumb__select'));
      select.triggerEventHandler('change', { target: { value: 'proj_growth' } });

      expect(spy).toHaveBeenCalledWith({ key: 'project', value: 'proj_growth' });
    });

    it('should reflect selectedId in the select element value', () => {
      fixture.componentRef.setInput('items', [
        {
          label: 'Project',
          key: 'project',
          selectOptions: [
            { id: 'proj_default', label: 'Default Project' },
            { id: 'proj_growth', label: 'Growth Experiments' },
          ],
          selectedId: 'proj_growth',
        },
      ]);
      fixture.detectChanges();

      const select: HTMLSelectElement = fixture.debugElement.query(
        By.css('.breadcrumb__select'),
      ).nativeElement;
      expect(select.value).toBe('proj_growth');
    });

    it('should fall back to label when key is missing', () => {
      const spy = jest.fn();
      component.selectionChange.subscribe(spy);
      fixture.componentRef.setInput('items', [
        {
          label: 'Workspace',
          selectOptions: [
            { id: 'proj_default', label: 'Default Project' },
            { id: 'proj_growth', label: 'Growth Experiments' },
          ],
          selectedId: 'proj_default',
        },
      ]);
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('.breadcrumb__select'));
      select.triggerEventHandler('change', { target: { value: 'proj_growth' } });

      expect(spy).toHaveBeenCalledWith({ key: 'Workspace', value: 'proj_growth' });
    });
  });
  describe('empty items', () => {
    it('should handle empty items array', () => {
      fixture.componentRef.setInput('items', []);
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.breadcrumb__item'));
      expect(items.length).toBe(0);
    });
  });

  describe('isLast', () => {
    it('should return true only for the last index', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const isLast = (component as unknown as { isLast: (index: number) => boolean }).isLast;
      expect(isLast.call(component, 0)).toBe(false);
      expect(isLast.call(component, 1)).toBe(false);
      expect(isLast.call(component, 2)).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have nav element with aria-label', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const nav = fixture.debugElement.query(By.css('nav'));
      expect(nav).toBeTruthy();
      expect(nav.nativeElement.getAttribute('aria-label')).toBe('Breadcrumb');
    });

    it('should mark current item with aria-current', () => {
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const currentItem = fixture.debugElement.query(By.css('.breadcrumb__current'));
      expect(currentItem.nativeElement.getAttribute('aria-current')).toBe('page');
    });
  });
});
