import { inject, Injectable } from '@angular/core';
import { ApolloError } from '@apollo/client/core';

import { SnackBarService } from './snack-bar/snack-bar.service';
import { captureException } from '../utils/log-utils';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpStatus } from './http-status';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private snackBarService = inject(SnackBarService);

  handleError(error: unknown) {
    console.error(error);

    if (this.suppressMessage(error)) {
      return;
    }

    const hasOriginalError = (obj: any): obj is { originalError: unknown } =>
      'originalError' in obj;

    captureException(hasOriginalError(error) ? error.originalError : error);
    this.snackBarService.error(
      error instanceof ApolloError
        ? error.message
        : 'Unknown error. Please try again.',
    );
  }

  private suppressMessage(error: unknown) {
    const isUnknownError = (checkError: unknown) =>
      checkError instanceof HttpErrorResponse &&
      checkError.status === HttpStatus._0_UNKNOWN_ERROR;

    const isApolloUnknownError = (checkError: unknown) =>
      checkError instanceof ApolloError &&
      isUnknownError(checkError.networkError);

    return (
      (isUnknownError(error) || isApolloUnknownError(error)) &&
      !window.navigator.onLine
    );
  }
}
