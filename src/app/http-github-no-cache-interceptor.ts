import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

/**
 * Interceptor that disables cache for GitHub REST API calls.
 */
@Injectable()
export class HttpGithubNoCacheInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (
      req.url.includes('https://api.github.com/') &&
      !req.url.includes('/graphql')
    ) {
      const headers = req.headers.set('If-None-Match', '');
      req = req.clone({ headers });
    }
    return next.handle(req);
  }
}
