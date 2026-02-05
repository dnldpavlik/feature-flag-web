import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api.tokens';

/**
 * Base class for CRUD API services.
 *
 * Provides standard REST operations for a resource:
 * - GET /resources - getAll()
 * - GET /resources/:id - getById()
 * - POST /resources - create()
 * - PATCH /resources/:id - update()
 * - DELETE /resources/:id - delete()
 *
 * @template T - The entity type returned by the API
 * @template C - The create input type (defaults to Partial<T>)
 * @template U - The update input type (defaults to Partial<T>)
 *
 * @example
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * export class ProjectApi extends CrudApi<Project, CreateProjectInput> {
 *   protected override resourcePath = 'projects';
 *
 *   // Add custom methods as needed
 *   setDefault(id: string): Observable<Project> {
 *     return this.http.post<Project>(`${this.baseUrl}/projects/${id}/default`, null);
 *   }
 * }
 * ```
 */
export abstract class CrudApi<T, C = Partial<T>, U = Partial<T>> {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = inject(API_BASE_URL);

  /** The resource path segment (e.g., 'projects', 'flags') */
  protected abstract resourcePath: string;

  /** Get the full URL for the resource */
  protected get resourceUrl(): string {
    return `${this.baseUrl}/${this.resourcePath}`;
  }

  /** GET all entities */
  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.resourceUrl);
  }

  /** GET entity by ID */
  getById(id: string): Observable<T> {
    return this.http.get<T>(`${this.resourceUrl}/${id}`);
  }

  /** POST create new entity */
  create(input: C): Observable<T> {
    return this.http.post<T>(this.resourceUrl, input);
  }

  /** PATCH update existing entity */
  update(id: string, updates: U): Observable<T> {
    return this.http.patch<T>(`${this.resourceUrl}/${id}`, updates);
  }

  /** DELETE entity by ID */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}
