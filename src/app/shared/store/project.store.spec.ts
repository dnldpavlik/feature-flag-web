import { TestBed } from '@angular/core/testing';

import { ProjectStore } from './project.store';

describe('ProjectStore', () => {
  let store: ProjectStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectStore],
    });

    store = TestBed.inject(ProjectStore);
  });

  it('should seed initial projects', () => {
    expect(store.projects().length).toBeGreaterThan(0);
  });

  it('should select a project', () => {
    store.selectProject('proj_growth');
    expect(store.selectedProjectId()).toBe('proj_growth');
  });

  it('should set the default project', () => {
    store.setDefaultProject('proj_growth');
    const defaults = store.projects().filter((project) => project.isDefault);
    expect(defaults.length).toBe(1);
    expect(defaults[0].id).toBe('proj_growth');
  });

  it('should add a project', () => {
    const initialCount = store.projects().length;

    store.addProject({
      key: 'pricing',
      name: 'Pricing Optimization',
      description: 'Pricing and packaging experiments.',
    });

    expect(store.projects().length).toBe(initialCount + 1);
  });

  it('should respect default flag when adding a project', () => {
    store.addProject({
      key: 'ops',
      name: 'Operations',
      description: 'Internal ops tooling.',
      isDefault: true,
    });

    const project = store.projects().find((item) => item.key === 'ops');
    expect(project?.isDefault).toBe(true);
  });

  it('should find projects by id', () => {
    const project = store.getProjectById('proj_default');
    expect(project?.key).toBe('default');
  });

  it('should return undefined when project is missing', () => {
    expect(store.getProjectById('proj_missing')).toBeUndefined();
  });

  it('should not update timestamps for unrelated projects when changing default', () => {
    store.addProject({
      key: 'labs',
      name: 'Labs',
      description: 'R&D experiments.',
    });

    const labsBefore = store.projects().find((item) => item.key === 'labs');
    store.setDefaultProject('proj_growth');
    const labsAfter = store.projects().find((item) => item.key === 'labs');

    expect(labsAfter?.updatedAt).toBe(labsBefore?.updatedAt);
  });

  it('should ignore delete when only one project remains', () => {
    store.deleteProject('proj_growth');
    store.deleteProject('proj_default');

    expect(store.projects().length).toBe(1);
  });

  it('should fall back to default project when selected is deleted', () => {
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

  it('should fall back to first project when no default exists', () => {
    store.setDefaultProject('proj_missing');
    store.selectProject('proj_growth');
    store.deleteProject('proj_growth');

    expect(store.selectedProjectId()).toBe('proj_default');
  });
});
