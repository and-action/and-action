import { inject, Injectable } from '@angular/core';
import { ApolloError } from '@apollo/client/core';

import { SnackBarService } from './snack-bar/snack-bar.service';
import { captureException } from '../utils/log-utils';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private snackBarService = inject(SnackBarService);

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
