import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CrudApi } from '@/app/core/api';
import { Flag, CreateFlagInput } from '@/app/features/flags/models/flag.model';
import { FlagTypeMap } from '@/app/features/flags/models/flag-value.model';

export interface UpdateFlagInput {
  name?: string;
  description?: string;
  tags?: string[];
  defaultValue?: FlagTypeMap[keyof FlagTypeMap];
}

export interface UpdateEnvironmentValueInput {
  value?: FlagTypeMap[keyof FlagTypeMap];
  enabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FlagApi extends CrudApi<Flag, CreateFlagInput, UpdateFlagInput> {
  protected override resourcePath = 'flags';

  getByKey(key: string): Observable<Flag> {
    return this.http.get<Flag>(`${this.resourceUrl}/key/${key}`);
  }

  updateEnvironmentValue(
    flagId: string,
    environmentId: string,
    updates: UpdateEnvironmentValueInput,
  ): Observable<Flag> {
    return this.http.patch<Flag>(
      `${this.resourceUrl}/${flagId}/environments/${environmentId}`,
      updates,
    );
  }
}
