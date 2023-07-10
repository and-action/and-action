import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppRouting } from './app-routing';

const retryOn401CountKey = 'retry-on-401-count';
const httpStatus401Unauthorized = 401;

/**
 * Interceptor that checks response for http error code 401.
 *
 * When the user is unauthorized, the interceptor tries to login, i.e. either the access token
 * is updated automatically or the user has to login via the login page.
 *
 * Other http errors are handled in HttpResponseErrorHandler.
 */
@Injectable()
export class HttpUnauthorizedInterceptor implements HttpInterceptor {
  private static readonly maxRetryCountOn401 = 3;

  private router = inject(Router);

  private static checkAndUpdateRetryCountOn401() {
    const retryCount = parseInt(
      sessionStorage.getItem(retryOn401CountKey) ?? '1',
      10,
    );
    const isRetry =
      retryCount <= HttpUnauthorizedInterceptor.maxRetryCountOn401;

    isRetry
      ? sessionStorage.setItem(retryOn401CountKey, `${retryCount + 1}`)
      : sessionStorage.removeItem(retryOn401CountKey);

    return isRetry;
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((response: unknown) => {
        if (
          response instanceof HttpErrorResponse &&
          response.status === httpStatus401Unauthorized
        ) {
          const isRetry =
            HttpUnauthorizedInterceptor.checkAndUpdateRetryCountOn401();

          if (isRetry) {
            this.router.navigate([AppRouting.LOGIN]);
            return EMPTY;
          }
        }
        return throwError(response);
      }),
    );
  }
}
