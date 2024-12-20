import { Component, inject, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { mergeMap, Observable, of, repeat, share, timer } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { ErrorService } from '../error.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * This component subscribes repeatedly to the given observable.
 * `pollIntervalInSeconds` defines the time between subscriptions.
 * The new interval begins after the observable emitted its value.
 * The UI shows the last time the observable emitted a value
 * and a progress bar that shows the time until next subscription.
 *
 * This component is useful e.g. if a view's data is updated regularly.
 * The user is informed about when the data was updated and when the next update takes place.
 *
 * IMPORTANT:
 * The component does not have an output binding. So if the observable emits data that
 * needs to be used in the client code, it should set it to some variable using the tap operator.
 *
 * The component catches errors that are thrown by the given observable to keep polling alive.
 * Nevertheless, it sends the error to Sentry.
 * The given observable itself should do additional individual error handling if needed.
 */
@Component({
  imports: [CommonModule, MatProgressBarModule, MatSnackBarModule],
  selector: 'ana-polling-progress',
  templateUrl: './polling-progess.component.html',
  styleUrl: './polling-progess.component.scss',
})
export class PollingProgessComponent<T> implements OnChanges {
  @Input({ required: true }) observable?: Observable<T>;
  @Input({ required: true }) pollIntervalInSeconds?: number;

  protected lastSubscription$?: Observable<Date | undefined>;
  protected progressBarValue$?: Observable<number>;

  private lastSubscription?: Date;
  private errorService = inject(ErrorService);

  ngOnChanges() {
    if (this.observable && this.pollIntervalInSeconds) {
      const updateProgressBarInterval = 200;
      const observable$ = this.observable;
      const pollIntervalInSeconds = this.pollIntervalInSeconds;

      this.lastSubscription$ = timer(0, pollIntervalInSeconds * 1000).pipe(
        mergeMap(() =>
          observable$.pipe(
            // Set new timestamp to lastSubscription only if no error occurs.
            // In case of an error, the timestamp of the last succesful update
            // should be shown.
            tap(() => (this.lastSubscription = new Date())),
            // Catch error to make sure that polling stays alive.
            catchError((error: unknown) => {
              this.errorService.handleError(error);
              return of(undefined);
            }),
          ),
        ),
        map(() => this.lastSubscription),
        share(),
      );

      this.progressBarValue$ = timer(0, updateProgressBarInterval).pipe(
        map(
          (value) =>
            ((((value + 1) * 100) / pollIntervalInSeconds) *
              updateProgressBarInterval) /
            1000,
        ),
        takeUntil(this.lastSubscription$),
        repeat(),
      );
    }
  }
}
