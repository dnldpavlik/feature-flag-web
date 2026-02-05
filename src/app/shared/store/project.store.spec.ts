import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProjectStore } from './project.store';
import { ProjectApi } from '@/app/features/projects/api/project.api';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import { Project } from '@/app/features/projects/models/project.model';
import { expectSignal, injectService, expectEmpty, MOCK_API_PROVIDERS } from '@/app/testing';

const SEED_TIMESTAMP = '2025-01-01T00:00:00.000Z';

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_default',
    key: 'default',
    name: 'Default Project',
    description: 'Primary feature flag workspace.',
    isDefault: true,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'proj_growth',
    key: 'growth',
    name: 'Growth Experiments',
    description: 'Revenue, onboarding, and conversion tests.',
    isDefault: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
];

function createMockApi(): jest.Mocked<ProjectApi> {
  return {
    getAll: jest.fn().mockReturnValue(of(MOCK_PROJECTS)),
    getById: jest.fn().mockReturnValue(of(MOCK_PROJECTS[0])),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn().mockReturnValue(of(undefined)),
    setDefault: jest.fn().mockReturnValue(of(MOCK_PROJECTS[0])),
  } as unknown as jest.Mocked<ProjectApi>;
}

describe('ProjectStore', () => {
  let store: ProjectStore;
  let mockApi: jest.Mocked<ProjectApi>;

  beforeEach(() => {
    mockApi = createMockApi();

    TestBed.configureTestingModule({
      providers: [
        ProjectStore,
        AuditStore,
        { provide: ProjectApi, useValue: mockApi },
        ...MOCK_API_PROVIDERS.filter((p) => (p as { provide: unknown }).provide !== ProjectApi),
      ],
    });

    store = injectService(ProjectStore);
  });

  describe('initial state', () => {
    it('should start with empty projects', () => {
      expectEmpty(store.projects);
    });

    it('should provide readonly projects signal', () => {
      expectSignal(store.projects);
    });

    it('should start with loading false', () => {
      expect(store.loading()).toBe(false);
    });

    it('should start with no error', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('loadProjects', () => {
    it('should load projects from API', async () => {
      await store.loadProjects();

      expect(store.projects()).toEqual(MOCK_PROJECTS);
      expect(store.projects()).toHaveLength(2);
    });

    it('should auto-select the default project', async () => {
      await store.loadProjects();

      expect(store.selectedProjectId()).toBe('proj_default');
    });

    it('should auto-select the first project if no default exists', async () => {
      const projectsNoDefault = MOCK_PROJECTS.map((p) => ({ ...p, isDefault: false }));
      mockApi.getAll.mockReturnValue(of(projectsNoDefault));

      await store.loadProjects();

      expect(store.selectedProjectId()).toBe('proj_default');
    });

    it('should set loading to false after load', async () => {
      await store.loadProjects();

      expect(store.loading()).toBe(false);
    });

    it('should set error on API failure', async () => {
      mockApi.getAll.mockReturnValue(throwError(() => new Error('Network error')));

      await store.loadProjects();

      expect(store.error()).toBe('Network error');
    });
  });

  describe('selectProject', () => {
    it('should update selectedProjectId', () => {
      store.selectProject('proj_growth');
      expect(store.selectedProjectId()).toBe('proj_growth');
    });

    it('should allow selecting different projects sequentially', () => {
      store.selectProject('proj_growth');
      store.selectProject('proj_default');
      expect(store.selectedProjectId()).toBe('proj_default');
    });
  });

  describe('addProject', () => {
    it('should add project returned from API to the store', async () => {
      const newProject: Project = {
        id: 'proj_new',
        key: 'pricing',
        name: 'Pricing Optimization',
        description: 'Pricing experiments.',
        isDefault: false,
        createdAt: SEED_TIMESTAMP,
        updatedAt: SEED_TIMESTAMP,
      };
      mockApi.create.mockReturnValue(of(newProject));

      await store.addProject({
        key: 'pricing',
        name: 'Pricing Optimization',
        description: 'Pricing experiments.',
      });

      expect(store.projects()).toHaveLength(1);
      expect(store.projects()[0]).toEqual(newProject);
    });

    it('should call API with the input', async () => {
      mockApi.create.mockReturnValue(of({ ...MOCK_PROJECTS[0], id: 'proj_new', key: 'test' }));

      const input = { key: 'test', name: 'Test', description: 'Desc' };
      await store.addProject(input);

      expect(mockApi.create).toHaveBeenCalledWith(input);
    });

    it('should not add project on API failure', async () => {
      mockApi.create.mockReturnValue(throwError(() => new Error('fail')));

      await store.addProject({ key: 'fail', name: 'Fail', description: 'Fails' });

      expect(store.projects()).toHaveLength(0);
    });
  });

  describe('setDefaultProject', () => {
    beforeEach(async () => {
      await store.loadProjects();
    });

    it('should call API and update locally', async () => {
      await store.setDefaultProject('proj_growth');

      expect(mockApi.setDefault).toHaveBeenCalledWith('proj_growth');
      const defaults = store.projects().filter((p) => p.isDefault);
      expect(defaults).toHaveLength(1);
      expect(defaults[0].id).toBe('proj_growth');
    });

    it('should remove default status from previous default', async () => {
      await store.setDefaultProject('proj_growth');

      const previousDefault = store.projects().find((p) => p.id === 'proj_default');
      expect(previousDefault?.isDefault).toBe(false);
    });

    it('should not update locally on API failure', async () => {
      mockApi.setDefault.mockReturnValue(throwError(() => new Error('fail')));

      await store.setDefaultProject('proj_growth');

      const defaultProj = store.projects().find((p) => p.isDefault);
      expect(defaultProj?.id).toBe('proj_default');
    });
  });

  describe('deleteProject', () => {
    beforeEach(async () => {
      await store.loadProjects();
    });

    it('should call API and remove project from store', async () => {
      await store.deleteProject('proj_growth');

      expect(mockApi.delete).toHaveBeenCalledWith('proj_growth');
      expect(store.projects()).toHaveLength(1);
      expect(store.projects().find((p) => p.id === 'proj_growth')).toBeUndefined();
    });

    it('should not delete when only one project remains', async () => {
      await store.deleteProject('proj_growth');
      await store.deleteProject('proj_default');

      expect(store.projects()).toHaveLength(1);
    });

    it('should fall back to default project when selected project is deleted', async () => {
      store.selectProject('proj_growth');

      await store.deleteProject('proj_growth');

      expect(store.selectedProjectId()).toBe('proj_default');
    });

    it('should not remove project on API failure', async () => {
      mockApi.delete.mockReturnValue(throwError(() => new Error('fail')));

      await store.deleteProject('proj_growth');

      expect(store.projects()).toHaveLength(2);
    });
  });

  describe('getProjectById', () => {
    beforeEach(async () => {
      await store.loadProjects();
    });

    it('should return project when id exists', () => {
      const project = store.getProjectById('proj_default');
      expect(project?.key).toBe('default');
    });

    it('should return undefined when project id does not exist', () => {
      expect(store.getProjectById('proj_missing')).toBeUndefined();
    });
  });

  describe('selectedProject', () => {
    it('should return the selected project', async () => {
      await store.loadProjects();

      expect(store.selectedProject()?.id).toBe('proj_default');
    });

    it('should update when selection changes', async () => {
      await store.loadProjects();
      store.selectProject('proj_growth');

      expect(store.selectedProject()?.id).toBe('proj_growth');
    });
  });

  describe('audit logging', () => {
    let auditStore: AuditStore;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ProjectStore,
          AuditStore,
          { provide: ProjectApi, useValue: mockApi },
          ...MOCK_API_PROVIDERS.filter((p) => (p as { provide: unknown }).provide !== ProjectApi),
        ],
      });

      store = injectService(ProjectStore);
      auditStore = injectService(AuditStore);
      jest.spyOn(auditStore, 'logAction');
    });

    it('should log audit entry when project is created', async () => {
      const newProject: Project = {
        id: 'proj_new',
        key: 'audit-test',
        name: 'Audit Test Project',
        description: 'Testing audit',
        isDefault: false,
        createdAt: SEED_TIMESTAMP,
        updatedAt: SEED_TIMESTAMP,
      };
      mockApi.create.mockReturnValue(of(newProject));

      await store.addProject({
        key: 'audit-test',
        name: 'Audit Test Project',
        description: 'Testing audit',
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'created',
          resourceType: 'project',
          resourceName: 'Audit Test Project',
        }),
      );
    });

    it('should log audit entry when project is deleted', async () => {
      await store.loadProjects();

      await store.deleteProject('proj_growth');

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'deleted',
          resourceType: 'project',
          resourceId: 'proj_growth',
          resourceName: 'Growth Experiments',
        }),
      );
    });

    it('should include user info in audit entry', async () => {
      const newProject: Project = {
        id: 'proj_user',
        key: 'user-test',
        name: 'User Test',
        description: 'Testing user info',
        isDefault: false,
        createdAt: SEED_TIMESTAMP,
        updatedAt: SEED_TIMESTAMP,
      };
      mockApi.create.mockReturnValue(of(newProject));

      await store.addProject({
        key: 'user-test',
        name: 'User Test',
        description: 'Testing user info',
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(String),
          userName: expect.any(String),
        }),
      );
    });
  });
});
