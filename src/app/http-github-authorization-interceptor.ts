import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { LoginService } from './core/login.service';

/**
 * Interceptor that appends authorization header for requests to moneymeets APIs.
 */
@Injectable()
export class HttpGithubAuthorizationInterceptor implements HttpInterceptor {
  constructor(private loginService: LoginService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const accessToken = this.loginService.accessToken;
    if (accessToken) {
      const headers = req.headers.set('Authorization', `Bearer ${accessToken}`);
      req = req.clone({ headers });
    }
    return next.handle(req);
  }
}
