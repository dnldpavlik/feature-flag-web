import { computed, effect, inject, Injectable, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';

import { environment } from '@/environments/environment';
import { UserProfile } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  private readonly _userProfile = signal<UserProfile | null>(null);
  private readonly _roles = signal<string[]>([]);

  readonly isAuthenticated = computed(() => {
    const event = this.keycloakSignal();
    return event.type === KeycloakEventType.Ready ||
      event.type === KeycloakEventType.AuthSuccess ||
      event.type === KeycloakEventType.AuthRefreshSuccess
      ? !!this.keycloak.authenticated
      : false;
  });

  readonly userProfile = this._userProfile.asReadonly();
  readonly roles = this._roles.asReadonly();

  readonly token = computed(() => this.keycloak.token);

  constructor() {
    effect(() => {
      const event = this.keycloakSignal();
      if (
        (event.type === KeycloakEventType.Ready || event.type === KeycloakEventType.AuthSuccess) &&
        this.keycloak.authenticated
      ) {
        void this.loadProfile();
        this.loadRoles();
      }
    });
  }

  async login(): Promise<void> {
    await this.keycloak.login();
  }

  async logout(): Promise<void> {
    await this.keycloak.logout({ redirectUri: window.location.origin });
  }

  hasRole(role: string): boolean {
    return this._roles().includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  private async loadProfile(): Promise<void> {
    try {
      const profile = await this.keycloak.loadUserProfile();
      this._userProfile.set({
        username: profile.username ?? '',
        email: profile.email ?? '',
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        fullName: [profile.firstName, profile.lastName].filter(Boolean).join(' '),
      });
    } catch {
      this._userProfile.set(null);
    }
  }

  private loadRoles(): void {
    const clientId = environment.keycloak.clientId;
    const clientRoles = this.keycloak.resourceAccess?.[clientId]?.roles ?? [];
    const realmRoles = this.keycloak.realmAccess?.roles ?? [];
    this._roles.set([...realmRoles, ...clientRoles]);
  }
}
