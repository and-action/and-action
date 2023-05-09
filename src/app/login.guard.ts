import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from './core/login.service';
import { AppRouting } from './app-routing';

export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const loginService = inject(LoginService);

  const isLoggedIn = !!loginService.accessToken;
  if (!isLoggedIn) {
    router.navigate([AppRouting.LOGIN]);
  }
  return isLoggedIn;
};
