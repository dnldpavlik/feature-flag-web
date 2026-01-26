import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SearchStore } from '@/app/shared/store/search.store';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import { AuditListComponent } from './audit-list';

describe('AuditList', () => {
  let fixture: ComponentFixture<AuditListComponent>;
  let component: AuditListComponent;
  let auditStore: AuditStore;
  let searchStore: SearchStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditListComponent],
      providers: [AuditStore, SearchStore],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditListComponent);
    component = fixture.componentInstance;
    auditStore = TestBed.inject(AuditStore);
    searchStore = TestBed.inject(SearchStore);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the audit log heading', () => {
    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading).toBeTruthy();
    expect(heading.nativeElement.textContent).toContain('Audit Log');
  });

  it('should render audit entry rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should display entry count', () => {
    const countEl = fixture.debugElement.query(By.css('.audit-count'));
    expect(countEl).toBeTruthy();
    expect(countEl.nativeElement.textContent).toContain(auditStore.entries().length.toString());
  });

  describe('action filtering', () => {
    it('should filter entries by created action', () => {
      const createdCount = auditStore.entries().filter((e) => e.action === 'created').length;

      component.onActionChange('created');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(createdCount);
    });

    it('should filter entries by updated action', () => {
      const updatedCount = auditStore.entries().filter((e) => e.action === 'updated').length;

      component.onActionChange('updated');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(updatedCount);
    });

    it('should filter entries by deleted action', () => {
      const deletedCount = auditStore.entries().filter((e) => e.action === 'deleted').length;

      component.onActionChange('deleted');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(deletedCount);
    });

    it('should filter entries by toggled action', () => {
      const toggledCount = auditStore.entries().filter((e) => e.action === 'toggled').length;

      component.onActionChange('toggled');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(toggledCount);
    });

    it('should show all entries when action filter is all', () => {
      component.onActionChange('created');
      fixture.detectChanges();

      component.onActionChange('all');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(auditStore.entries().length);
    });
  });

  describe('resource type filtering', () => {
    it('should filter entries by flag resource type', () => {
      const flagCount = auditStore.entries().filter((e) => e.resourceType === 'flag').length;

      component.onResourceChange('flag');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(flagCount);
    });

    it('should filter entries by segment resource type', () => {
      const segmentCount = auditStore.entries().filter((e) => e.resourceType === 'segment').length;

      component.onResourceChange('segment');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(segmentCount);
    });

    it('should filter entries by environment resource type', () => {
      const envCount = auditStore.entries().filter((e) => e.resourceType === 'environment').length;

      component.onResourceChange('environment');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(envCount);
    });

    it('should filter entries by project resource type', () => {
      const projectCount = auditStore.entries().filter((e) => e.resourceType === 'project').length;

      component.onResourceChange('project');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(projectCount);
    });

    it('should show all entries when resource filter is all', () => {
      component.onResourceChange('flag');
      fixture.detectChanges();

      component.onResourceChange('all');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(auditStore.entries().length);
    });
  });

  describe('combined filtering', () => {
    it('should filter by both action and resource type', () => {
      const createdFlagCount = auditStore
        .entries()
        .filter((e) => e.action === 'created' && e.resourceType === 'flag').length;

      component.onActionChange('created');
      component.onResourceChange('flag');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(createdFlagCount);
    });
  });

  describe('search filtering', () => {
    it('should filter entries by search query', () => {
      searchStore.setQuery('zzzz-no-match');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBe(0);
    });

    it('should search in resource name', () => {
      searchStore.setQuery('Dark Mode');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should search in user name', () => {
      searchStore.setQuery('Admin User');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should search in details', () => {
      searchStore.setQuery('boolean flag');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.audit-table__row'));
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe('empty states', () => {
    it('should show empty state when no matches found', () => {
      searchStore.setQuery('zzzz-no-match');
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
      expect(emptyState).toBeTruthy();
    });
  });

  describe('action badge display', () => {
    it('should format action for display', () => {
      const formatted = component.formatAction('created');
      expect(formatted).toBe('Created');
    });

    it('should format updated action', () => {
      const formatted = component.formatAction('updated');
      expect(formatted).toBe('Updated');
    });

    it('should format deleted action', () => {
      const formatted = component.formatAction('deleted');
      expect(formatted).toBe('Deleted');
    });

    it('should format toggled action', () => {
      const formatted = component.formatAction('toggled');
      expect(formatted).toBe('Toggled');
    });
  });

  describe('resource type display', () => {
    it('should format resource type for display', () => {
      const formatted = component.formatResourceType('flag');
      expect(formatted).toBe('Flag');
    });

    it('should format segment resource type', () => {
      const formatted = component.formatResourceType('segment');
      expect(formatted).toBe('Segment');
    });

    it('should format environment resource type', () => {
      const formatted = component.formatResourceType('environment');
      expect(formatted).toBe('Environment');
    });

    it('should format project resource type', () => {
      const formatted = component.formatResourceType('project');
      expect(formatted).toBe('Project');
    });
  });
});
