import * as Sentry from '@sentry/browser';
import { ErrorHandler, inject, Injectable } from '@angular/core';

import { environment } from '../environments/environment';
import { ErrorService } from './error.service';

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
  private errorService = inject(ErrorService);

  handleError(error: any) {
    this.errorService.handleError(error);
  }
}
