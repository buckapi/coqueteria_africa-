import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { pocketBase } from './pocketbase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal(pocketBase.authStore.record);
  readonly userEmail = computed(() => String(this.user()?.['email'] ?? 'Administradora'));
  readonly busy = signal(false);

  constructor(private readonly router: Router) {
    pocketBase.authStore.onChange((_token, record) => this.user.set(record));
  }

  get isAuthenticated(): boolean {
    return (
      pocketBase.authStore.isValid && pocketBase.authStore.record?.collectionName === 'store_admins'
    );
  }

  async restore(): Promise<boolean> {
    if (!pocketBase.authStore.isValid) return false;
    try {
      await pocketBase.collection('store_admins').authRefresh();
      return this.isAuthenticated;
    } catch {
      this.logout(false);
      return false;
    }
  }

  async login(identity: string, password: string): Promise<void> {
    this.busy.set(true);
    try {
      await pocketBase.collection('store_admins').authWithPassword(identity, password);
      if (!this.isAuthenticated) throw new Error('La cuenta no tiene permisos de administración.');
      await this.router.navigateByUrl('/admin');
    } finally {
      this.busy.set(false);
    }
  }

  async logout(redirect = true): Promise<void> {
    pocketBase.authStore.clear();
    if (redirect) await this.router.navigateByUrl('/admin/login');
  }
}
