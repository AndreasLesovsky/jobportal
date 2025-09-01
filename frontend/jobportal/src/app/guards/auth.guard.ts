// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

export const authGuard: CanActivateFn = async () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.loginSuccess() === true) {
    return true;
  }

  const isLoggedIn = await loginService.checkSession();

  return isLoggedIn ? true : router.createUrlTree(['/login']);
};
