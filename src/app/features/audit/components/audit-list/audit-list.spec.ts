import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchStore } from '@/app/shared/store/search.store';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import { AuditListComponent } from './audit-list';
import {
  expectHeading,
  expectEmptyState,
  getTableRows,
  getRowCount,
  query,
  injectService,
  getComponent,
  MOCK_API_PROVIDERS,
} from '@/app/testing';

describe('AuditList', () => {
  let fixture: ComponentFixture<AuditListComponent>;
  let component: AuditListComponent;
  let auditStore: AuditStore;
  let searchStore: SearchStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditListComponent],
      providers: [AuditStore, SearchStore, ...MOCK_API_PROVIDERS],
    }).compileComponents();

    auditStore = injectService(AuditStore);
    searchStore = injectService(SearchStore);
    await auditStore.loadEntries();
    fixture = TestBed.createComponent(AuditListComponent);
    component = getComponent(fixture);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the audit log heading', () => {
    expectHeading(fixture, 'Audit Log');
  });

  it('should render audit entry rows', () => {
    const rows = getTableRows(fixture);
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should display entry count', () => {
    const countEl = query(fixture, '.toolbar__count');
    expect(countEl).toBeTruthy();
    expect(countEl?.nativeElement.textContent).toContain(auditStore.entries().length.toString());
  });

  describe('action filtering', () => {
    it('should filter entries by created action', () => {
      const createdCount = auditStore.entries().filter((e) => e.action === 'created').length;

      component.onActionChange('created');
      fixture.detectChanges();

      expect(getRowCount(fixture)).toBe(createdCount);
    });

    it('should filter entries by updated action', () => {
      const updatedCount = auditStore.entries().filter((e) => e.action === 'updated').length;

      component.onActionChange('updated');
      fixture.detectChanges();

      expect(getRowCount(fixture)).toBe(updatedCount);
    });

    it('should filter entries by deleted action', () => {
      const deletedCount = auditStore.entries().filter((e) => e.action === 'deleted').length;

      component.onActionChange('deleted');
      fixture.detectChanges();

      expect(getRowCount(fixture)).toBe(deletedCount);
    });

    it('should filter entries by toggled action', () => {
      const toggledCount = auditStore.entries().filter((e) => e.action === 'toggled').length;

      component.onActionChange('toggled');
      fixture.detectChanges();

      expect(getRowCount(fixture)).toBe(toggledCount);
    });

    it('should show all entries when action filter is all', () => {
      component.onActionChange('created');
      fixture.detectChanges();

      component.onActionChange('all');
      fixture.detectChanges();

      expect(getRowCount(fixture)).toBe(auditStore.entries().length);
    });
  });

  describe('resource type filtering', () => {
    it('should filter entries by flag resource type', () => {
      const flagCount = auditStore.entries().filter((e) => e.resourceType === 'flag').length;

      component.onResourceChange('flag');
      fixture.detectChanges();

      expect(getRowCount(fixture)).toBe(flagCount);
    });

    it('should filter entries by segment resource type', () => {
      const segmentCount = auditStore.entries().filter((e) => e.resourceType === 'segment').length;

      component.onResourceChange('segment');
      fixture.detectChanges();

      expect(getRowCount(fixture)).toBe(segmentCount);
    });

    it('should filter entries by environment resource type', () => {
      const envCount = auditStore.entries().filter((e) => e.resourceType === 'environment').length;

      component.onResourceChange('environment');
      fixture.detectChanges();

      expect(getRowCount(fixture)).toBe(envCount);
    });

    it('should filter entries by project resource type', () => {
      const projectCount = auditStore.entries().filter((e) => e.resourceType === 'project').length;

      component.onResourceChange('project');
      fixture.detectChanges();

      expect(getRowCount(fixture)).toBe(projectCount);
    });

    it('should show all entries when resource filter is all', () => {
      component.onResourceChange('flag');
      fixture.detectChanges();

      component.onResourceChange('all');
      fixture.detectChanges();

      expect(getRowCount(fixture)).toBe(auditStore.entries().length);
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

      expect(getRowCount(fixture)).toBe(createdFlagCount);
    });
  });

  describe('search filtering', () => {
    it('should filter entries by search query', () => {
      searchStore.setQuery('zzzz-no-match');
      fixture.detectChanges();

      expect(getRowCount(fixture)).toBe(0);
    });

    it('should search in resource name', () => {
      searchStore.setQuery('Dark Mode');
      fixture.detectChanges();

      const rows = getTableRows(fixture);
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should search in user name', () => {
      searchStore.setQuery('Admin User');
      fixture.detectChanges();

      const rows = getTableRows(fixture);
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should search in details', () => {
      searchStore.setQuery('boolean flag');
      fixture.detectChanges();

      const rows = getTableRows(fixture);
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe('empty states', () => {
    it('should show empty state when no matches found', () => {
      searchStore.setQuery('zzzz-no-match');
      fixture.detectChanges();

      expectEmptyState(fixture);
    });
  });

  describe('action badge display', () => {
    it('should pre-compute formatted action for created entries', () => {
      component.onActionChange('created');
      fixture.detectChanges();

      const entries = (
        component as unknown as { filteredEntries: () => { formattedAction: string }[] }
      ).filteredEntries();
      entries.forEach((entry) => {
        expect(entry.formattedAction).toBe('Created');
      });
    });

    it('should pre-compute formatted action for updated entries', () => {
      component.onActionChange('updated');
      fixture.detectChanges();

      const entries = (
        component as unknown as { filteredEntries: () => { formattedAction: string }[] }
      ).filteredEntries();
      entries.forEach((entry) => {
        expect(entry.formattedAction).toBe('Updated');
      });
    });

    it('should pre-compute formatted action for deleted entries', () => {
      component.onActionChange('deleted');
      fixture.detectChanges();

      const entries = (
        component as unknown as { filteredEntries: () => { formattedAction: string }[] }
      ).filteredEntries();
      entries.forEach((entry) => {
        expect(entry.formattedAction).toBe('Deleted');
      });
    });

    it('should pre-compute formatted action for toggled entries', () => {
      component.onActionChange('toggled');
      fixture.detectChanges();

      const entries = (
        component as unknown as { filteredEntries: () => { formattedAction: string }[] }
      ).filteredEntries();
      entries.forEach((entry) => {
        expect(entry.formattedAction).toBe('Toggled');
      });
    });
  });

  describe('resource type display', () => {
    it('should pre-compute formatted resource type for flag entries', () => {
      component.onResourceChange('flag');
      fixture.detectChanges();

      const entries = (
        component as unknown as { filteredEntries: () => { formattedResourceType: string }[] }
      ).filteredEntries();
      entries.forEach((entry) => {
        expect(entry.formattedResourceType).toBe('Flag');
      });
    });

    it('should pre-compute formatted resource type for segment entries', () => {
      component.onResourceChange('segment');
      fixture.detectChanges();

      const entries = (
        component as unknown as { filteredEntries: () => { formattedResourceType: string }[] }
      ).filteredEntries();
      entries.forEach((entry) => {
        expect(entry.formattedResourceType).toBe('Segment');
      });
    });

    it('should pre-compute formatted resource type for environment entries', () => {
      component.onResourceChange('environment');
      fixture.detectChanges();

      const entries = (
        component as unknown as { filteredEntries: () => { formattedResourceType: string }[] }
      ).filteredEntries();
      entries.forEach((entry) => {
        expect(entry.formattedResourceType).toBe('Environment');
      });
    });

    it('should pre-compute formatted resource type for project entries', () => {
      component.onResourceChange('project');
      fixture.detectChanges();

      const entries = (
        component as unknown as { filteredEntries: () => { formattedResourceType: string }[] }
      ).filteredEntries();
      entries.forEach((entry) => {
        expect(entry.formattedResourceType).toBe('Project');
      });
    });
  });
});
