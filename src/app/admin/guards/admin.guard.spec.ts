import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../../core/services/auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  it('redirects unauthenticated users to login', async () => {
    const auth = { restore: vi.fn().mockResolvedValue(false) };
    const router = { createUrlTree: vi.fn().mockReturnValue(['/admin/login']) };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });

    const result = await TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot),
    );

    expect(result).toEqual(['/admin/login']);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/login'], {
      queryParams: { returnUrl: '/admin' },
    });
  });

  it('allows a valid administrative session', async () => {
    const auth = { restore: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: {} },
      ],
    });

    const result = await TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });
});
