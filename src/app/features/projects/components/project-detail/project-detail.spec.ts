import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { ProjectStore } from '@/app/shared/store/project.store';
import { ProjectDetailComponent } from './project-detail';
import { MOCK_API_PROVIDERS } from '@/app/testing';

describe('ProjectDetail', () => {
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let store: ProjectStore;
  let router: Router;

  const build = async (projectId?: string) => {
    const paramMap$ = new BehaviorSubject(convertToParamMap(projectId ? { projectId } : {}));
    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [
        ProjectStore,
        ...MOCK_API_PROVIDERS,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: paramMap$.value,
            },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    store = TestBed.inject(ProjectStore);
    router = TestBed.inject(Router);
    await store.loadProjects();
    fixture.detectChanges();

    return { paramMap$ };
  };

  it('should render project details', async () => {
    await build('proj_default');

    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent).toContain('Default Project');
  });

  it('should select the project', async () => {
    await build('proj_growth');
    const selectSpy = jest.spyOn(store, 'selectProject');

    fixture.componentInstance.selectProject();

    expect(selectSpy).toHaveBeenCalledWith('proj_growth');
  });

  it('should make the project default', async () => {
    await build('proj_growth');
    const defaultSpy = jest.spyOn(store, 'setDefaultProject');

    fixture.componentInstance.makeDefault();

    expect(defaultSpy).toHaveBeenCalledWith('proj_growth');
  });

  it('should delete the project and navigate back', async () => {
    await build('proj_growth');
    const deleteSpy = jest.spyOn(store, 'deleteProject');
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.deleteProject();

    expect(deleteSpy).toHaveBeenCalledWith('proj_growth');
    expect(navSpy).toHaveBeenCalledWith(['/projects']);
  });

  it('should navigate back to list', async () => {
    await build('proj_default');
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.backToList();

    expect(navSpy).toHaveBeenCalledWith(['/projects']);
  });

  it('should show empty state when project is missing', async () => {
    await build('proj_missing');

    const empty = fixture.debugElement.query(By.css('app-empty-state'));
    expect(empty).toBeTruthy();
  });

  it('should treat missing route param as empty id', async () => {
    await build();

    const empty = fixture.debugElement.query(By.css('app-empty-state'));
    expect(empty).toBeTruthy();
  });

  it('should ignore actions when project is missing', async () => {
    await build('proj_missing');
    const selectSpy = jest.spyOn(store, 'selectProject');
    const defaultSpy = jest.spyOn(store, 'setDefaultProject');
    const deleteSpy = jest.spyOn(store, 'deleteProject');

    fixture.componentInstance.selectProject();
    fixture.componentInstance.makeDefault();
    fixture.componentInstance.deleteProject();

    expect(selectSpy).not.toHaveBeenCalled();
    expect(defaultSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('should respond to route changes', async () => {
    const { paramMap$ } = await build('proj_growth');

    paramMap$.next(convertToParamMap({ projectId: 'proj_default' }));
    fixture.detectChanges();

    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent).toContain('Default Project');
  });
});
