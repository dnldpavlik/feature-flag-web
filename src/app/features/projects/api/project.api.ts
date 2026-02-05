import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CrudApi } from '@/app/core/api';
import { Project, CreateProjectInput } from '../models/project.model';

export type UpdateProjectInput = Partial<CreateProjectInput>;

@Injectable({ providedIn: 'root' })
export class ProjectApi extends CrudApi<Project, CreateProjectInput, UpdateProjectInput> {
  protected override resourcePath = 'projects';

  setDefault(id: string): Observable<Project> {
    return this.http.post<Project>(`${this.resourceUrl}/${id}/default`, null);
  }
}
