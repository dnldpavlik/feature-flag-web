import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';

import { API_BASE_URL } from './api.tokens';
import { CrudApi } from './crud.api';

interface TestEntity {
  id: string;
  name: string;
}

interface CreateTestEntity {
  name: string;
}

interface UpdateTestEntity {
  name?: string;
}

@Injectable()
class TestApi extends CrudApi<TestEntity, CreateTestEntity, UpdateTestEntity> {
  protected override resourcePath = 'test-entities';
}

describe('CrudApi', () => {
  let api: TestApi;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:3000/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        TestApi,
      ],
    });

    api = TestBed.inject(TestApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('should GET all entities', () => {
      const mockEntities: TestEntity[] = [
        { id: '1', name: 'Entity 1' },
        { id: '2', name: 'Entity 2' },
      ];

      api.getAll().subscribe((entities) => {
        expect(entities).toEqual(mockEntities);
      });

      const req = httpMock.expectOne(`${baseUrl}/test-entities`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEntities);
    });
  });

  describe('getById', () => {
    it('should GET entity by id', () => {
      const mockEntity: TestEntity = { id: '1', name: 'Entity 1' };

      api.getById('1').subscribe((entity) => {
        expect(entity).toEqual(mockEntity);
      });

      const req = httpMock.expectOne(`${baseUrl}/test-entities/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEntity);
    });
  });

  describe('create', () => {
    it('should POST new entity', () => {
      const input: CreateTestEntity = { name: 'New Entity' };
      const mockResponse: TestEntity = { id: '3', name: 'New Entity' };

      api.create(input).subscribe((entity) => {
        expect(entity).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/test-entities`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should PATCH entity', () => {
      const updates: UpdateTestEntity = { name: 'Updated Name' };
      const mockResponse: TestEntity = { id: '1', name: 'Updated Name' };

      api.update('1', updates).subscribe((entity) => {
        expect(entity).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/test-entities/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should DELETE entity', () => {
      api.delete('1').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/test-entities/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
