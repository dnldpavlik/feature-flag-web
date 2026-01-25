import { Injectable, computed, signal } from '@angular/core';

import { CreateEnvironmentInput, Environment } from '../../features/flags/models/environment.model';

const nowStamp = () => new Date().toISOString();
const createId = () => `env_${Math.random().toString(36).slice(2, 10)}`;

@Injectable({ providedIn: 'root' })
export class EnvironmentStore {
  private readonly _environments = signal<Environment[]>([
    {
      id: 'env_development',
      key: 'development',
      name: 'Development',
      color: '#10B981',
      order: 0,
      isDefault: true,
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
    },
    {
      id: 'env_staging',
      key: 'staging',
      name: 'Staging',
      color: '#F59E0B',
      order: 1,
      isDefault: false,
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
    },
    {
      id: 'env_production',
      key: 'production',
      name: 'Production',
      color: '#EF4444',
      order: 2,
      isDefault: false,
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
    },
  ]);

  private readonly _selectedEnvironmentId = signal<string>('env_development');

  readonly environments = this._environments.asReadonly();
  readonly selectedEnvironmentId = this._selectedEnvironmentId.asReadonly();

  readonly sortedEnvironments = computed(() =>
    [...this._environments()].sort((a, b) => a.order - b.order)
  );

  readonly selectedEnvironment = computed(() =>
    this._environments().find((e) => e.id === this._selectedEnvironmentId())
  );

  readonly defaultEnvironment = computed(() =>
    this._environments().find((e) => e.isDefault)
  );

  selectEnvironment(environmentId: string): void {
    this._selectedEnvironmentId.set(environmentId);
  }

  setDefaultEnvironment(environmentId: string): void {
    const stamp = nowStamp();
    this._environments.update((envs) =>
      envs.map((env) => ({
        ...env,
        isDefault: env.id === environmentId,
        updatedAt: env.id === environmentId || env.isDefault ? stamp : env.updatedAt,
      }))
    );
  }

  addEnvironment(input: CreateEnvironmentInput): void {
    const stamp = nowStamp();
    const newEnv: Environment = {
      id: createId(),
      key: input.key,
      name: input.name,
      color: input.color,
      order: input.order,
      isDefault: input.isDefault ?? false,
      createdAt: stamp,
      updatedAt: stamp,
    };

    this._environments.update((envs) => [...envs, newEnv]);
  }

  getEnvironmentById(id: string): Environment | undefined {
    return this._environments().find((e) => e.id === id);
  }
}
