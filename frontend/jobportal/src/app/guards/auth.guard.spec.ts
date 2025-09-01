import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth.guard';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

describe('authGuard', () => {
  let loginServiceMock: jasmine.SpyObj<LoginService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginServiceMock = jasmine.createSpyObj('LoginService', ['checkSession']);
    routerMock = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: LoginService, useValue: loginServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should allow the route if logged in', async () => {
    loginServiceMock.checkSession.and.resolveTo(true);

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );

    expect(result).toBeTrue();
  });

  it('should redirect to login if not logged in', async () => {
    const fakeTree = {} as any;
    loginServiceMock.checkSession.and.resolveTo(false);
    routerMock.createUrlTree.and.returnValue(fakeTree);

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );

    expect(result).toBe(fakeTree);
  });
});
