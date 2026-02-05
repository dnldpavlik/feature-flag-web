import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CrudApi } from '@/app/core/api';
import {
  Environment,
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
} from '@/app/features/flags/models/environment.model';

@Injectable({ providedIn: 'root' })
export class EnvironmentApi extends CrudApi<
  Environment,
  CreateEnvironmentInput,
  UpdateEnvironmentInput
> {
  protected override resourcePath = 'environments';

  setDefault(id: string): Observable<Environment> {
    return this.http.post<Environment>(`${this.resourceUrl}/${id}/default`, null);
  }
}
