import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RoleGuard);
    route = new ActivatedRouteSnapshot();
    state = {} as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if role matches', () => {
    route.data = { role: 'admin' };
    localStorage.setItem('userRole', 'admin');

    const result = guard.canActivate(route, state);
    expect(result).toBeTrue();
  });

  it('should deny access if role mismatches', () => {
    route.data = { role: 'admin' };
    localStorage.setItem('userRole', 'doctor');

    const result = guard.canActivate(route, state);
    expect(result).toBeFalse();
  });
});
