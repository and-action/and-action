import * as Sentry from '@sentry/browser';
import { ErrorHandler, Injectable } from '@angular/core';
import { ApolloError } from '@apollo/client/core';

import { environment } from '../environments/environment';
import { SnackBarService } from './snack-bar/snack-bar.service';
import { captureException } from '../utils/log-utils';

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
  constructor(private snackBarService: SnackBarService) {}

  handleError(error: any) {
    captureException(error.originalError ?? error);
    console.error(error);

    this.snackBarService.error(
      error instanceof ApolloError
        ? error.message
        : 'Unknown error. Please try again.'
    );
  }
}
