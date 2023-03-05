import * as Sentry from '@sentry/browser';
import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../environments/environment';

if (environment.sentryDsn) {
  Sentry.init({
    dsn: environment.sentryDsn,
    environment: environment.name,
    maxValueLength: 20000,
    normalizeDepth: 10, // Don't disable since this leads to exceptions for cyclic objects.
  });
}

@Injectable()
export class AndActionErrorHandler implements ErrorHandler {
  handleError(error: any) {
    Sentry.captureException(error.originalError || error);
    console.error(error);
  }
}
