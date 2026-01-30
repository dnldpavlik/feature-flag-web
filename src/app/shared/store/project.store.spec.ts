import { TestBed } from '@angular/core/testing';

import { ProjectStore } from './project.store';
import {
  expectSignal,
  expectHasItems,
  expectIdPattern,
  expectItemAdded,
  getCountBefore,
  findByKey,
  injectService,
} from '@/app/testing';

describe('ProjectStore', () => {
  let store: ProjectStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectStore],
    });

    store = injectService(ProjectStore);
  });

  describe('initial state', () => {
    it('should seed with pre-configured projects', () => {
      expectHasItems(store.projects);
    });

    it('should include a default project', () => {
      const defaultProject = store.projects().find((p) => p.isDefault);
      expect(defaultProject).toBeDefined();
    });

    it('should provide readonly projects signal', () => {
      expectSignal(store.projects);
    });
  });

  describe('selectProject', () => {
    it('should update selectedProjectId when valid project is selected', () => {
      store.selectProject('proj_growth');
      expect(store.selectedProjectId()).toBe('proj_growth');
    });

    it('should allow selecting different projects sequentially', () => {
      store.selectProject('proj_growth');
      store.selectProject('proj_default');
      expect(store.selectedProjectId()).toBe('proj_default');
    });
  });

  describe('setDefaultProject', () => {
    it('should mark the specified project as default', () => {
      store.setDefaultProject('proj_growth');
      const defaults = store.projects().filter((project) => project.isDefault);
      expect(defaults.length).toBe(1);
      expect(defaults[0].id).toBe('proj_growth');
    });

    it('should remove default status from previous default project', () => {
      store.setDefaultProject('proj_growth');
      const previousDefault = store.projects().find((p) => p.id === 'proj_default');
      expect(previousDefault?.isDefault).toBe(false);
    });

    it('should not update timestamps for unrelated projects', () => {
      store.addProject({
        key: 'labs',
        name: 'Labs',
        description: 'R&D experiments.',
      });

      const labsBefore = findByKey(store.projects, 'labs');
      store.setDefaultProject('proj_growth');
      const labsAfter = findByKey(store.projects, 'labs');

      expect(labsAfter?.updatedAt).toBe(labsBefore?.updatedAt);
    });
  });

  describe('addProject', () => {
    it('should add a new project to the store', () => {
      const countBefore = getCountBefore(store.projects);

      store.addProject({
        key: 'pricing',
        name: 'Pricing Optimization',
        description: 'Pricing and packaging experiments.',
      });

      expectItemAdded(store.projects, countBefore);
    });

    it('should create project with provided key', () => {
      store.addProject({
        key: 'unique-key',
        name: 'Test Project',
        description: 'Description',
      });

      const project = findByKey(store.projects, 'unique-key');
      expect(project?.key).toBe('unique-key');
    });

    it('should respect isDefault flag when adding a project', () => {
      store.addProject({
        key: 'ops',
        name: 'Operations',
        description: 'Internal ops tooling.',
        isDefault: true,
      });

      const project = findByKey(store.projects, 'ops');
      expect(project?.isDefault).toBe(true);
    });

    it('should generate unique id for new project', () => {
      store.addProject({
        key: 'new-proj',
        name: 'New Project',
        description: 'Test',
      });

      const project = findByKey(store.projects, 'new-proj');
      expectIdPattern(project!.id, 'proj');
    });
  });

  describe('getProjectById', () => {
    it('should return project when id exists', () => {
      const project = store.getProjectById('proj_default');
      expect(project?.key).toBe('default');
    });

    it('should return undefined when project id does not exist', () => {
      expect(store.getProjectById('proj_missing')).toBeUndefined();
    });

    it('should return newly added project by id', () => {
      store.addProject({
        key: 'findable',
        name: 'Findable Project',
        description: 'Test',
      });

      const added = findByKey(store.projects, 'findable');
      const found = store.getProjectById(added!.id);
      expect(found?.name).toBe('Findable Project');
    });
  });

  describe('deleteProject', () => {
    it('should remove project from store', () => {
      const initialCount = store.projects().length;
      store.addProject({
        key: 'deletable',
        name: 'Deletable',
        description: 'Will be deleted',
      });
      const project = findByKey(store.projects, 'deletable');

      store.deleteProject(project!.id);

      expect(store.projects().length).toBe(initialCount);
    });

    it('should not delete when only one project remains', () => {
      store.deleteProject('proj_growth');
      store.deleteProject('proj_default');

      expect(store.projects().length).toBe(1);
    });

    it('should fall back to default project when selected project is deleted', () => {
      store.addProject({
        key: 'ops',
        name: 'Operations',
        description: 'Ops tooling.',
        isDefault: true,
      });

      store.selectProject('proj_growth');
      store.deleteProject('proj_growth');

      expect(store.selectedProjectId()).toBe('proj_default');
    });

    it('should fall back to first project when no default exists after deletion', () => {
      store.setDefaultProject('proj_missing');
      store.selectProject('proj_growth');
      store.deleteProject('proj_growth');

      expect(store.selectedProjectId()).toBe('proj_default');
    });

    it('should ignore deletion of non-existent project id', () => {
      const initialCount = store.projects().length;
      store.deleteProject('proj_nonexistent');
      expect(store.projects().length).toBe(initialCount);
    });
  });
});
