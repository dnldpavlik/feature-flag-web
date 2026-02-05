import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@/app/core/api';
import { ProjectApi } from './project.api';
import { Project, CreateProjectInput } from '../models/project.model';

describe('ProjectApi', () => {
  let api: ProjectApi;
  let httpTesting: HttpTestingController;
  const BASE_URL = '/api/v1';

  const mockProject: Project = {
    id: 'proj_1',
    key: 'default',
    name: 'Default Project',
    description: 'Primary workspace',
    isDefault: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });

    api = TestBed.inject(ProjectApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getAll', () => {
    it('should GET /projects', () => {
      const projects: Project[] = [mockProject];
      api.getAll().subscribe((result) => {
        expect(result).toEqual(projects);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/projects`);
      expect(req.request.method).toBe('GET');
      req.flush(projects);
    });
  });

  describe('getById', () => {
    it('should GET /projects/:id', () => {
      api.getById('proj_1').subscribe((result) => {
        expect(result).toEqual(mockProject);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/projects/proj_1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProject);
    });
  });

  describe('create', () => {
    it('should POST /projects', () => {
      const input: CreateProjectInput = {
        key: 'new-proj',
        name: 'New Project',
        description: 'A new project',
      };

      api.create(input).subscribe((result) => {
        expect(result.name).toBe('New Project');
      });

      const req = httpTesting.expectOne(`${BASE_URL}/projects`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush({ ...mockProject, ...input, id: 'proj_new' });
    });
  });

  describe('update', () => {
    it('should PATCH /projects/:id', () => {
      const updates = { name: 'Updated Name' };

      api.update('proj_1', updates).subscribe((result) => {
        expect(result.name).toBe('Updated Name');
      });

      const req = httpTesting.expectOne(`${BASE_URL}/projects/proj_1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockProject, name: 'Updated Name' });
    });
  });

  describe('delete', () => {
    it('should DELETE /projects/:id', () => {
      api.delete('proj_1').subscribe();

      const req = httpTesting.expectOne(`${BASE_URL}/projects/proj_1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('setDefault', () => {
    it('should POST /projects/:id/default', () => {
      api.setDefault('proj_1').subscribe((result) => {
        expect(result).toEqual(mockProject);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/projects/proj_1/default`);
      expect(req.request.method).toBe('POST');
      req.flush(mockProject);
    });
  });
});
