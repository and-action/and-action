import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { LoginService } from './core/login.service';
import { AppRouting } from './app-routing';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(private router: Router, private loginService: LoginService) {}

  canActivate() {
    const isLoggedIn = !!this.loginService.accessToken;
    if (!isLoggedIn) {
      this.router.navigate([AppRouting.LOGIN]);
    }
    return isLoggedIn;
  }
}
