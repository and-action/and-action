import {
  Component,
  input,
  linkedSignal,
  ResourceRef,
  ResourceStatus,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { repeat, Subject, timer } from 'rxjs';
import { map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

const updateProgressBarInterval = 200;

/**
 * This component reloads the given resource.
 * `pollIntervalInSeconds` defines the time between reloads.
 * The UI shows the last time the resource was loaded
 * and a progress bar that shows the time until next reload.
 *
 * This component is useful e.g. if a view's data is updated regularly.
 * The user is informed about when the data was updated and when the next update takes place.
 *
 * The component does not handle any errors happening while reloading.
 */
@Component({
  imports: [CommonModule, MatProgressBarModule, MatSnackBarModule],
  selector: 'ana-polling-progress',
  templateUrl: './polling-progess.component.html',
  styleUrl: './polling-progess.component.scss',
})
export class PollingProgessComponent<T> {
  resource = input.required<ResourceRef<T>>();
  pollIntervalInSeconds = input.required<number>();

  protected lastUpdate = linkedSignal<ResourceRef<T>, Date | undefined>({
    source: this.resource,
    computation: (resource: ResourceRef<T>, previous) => {
      const result =
        resource.status() === ResourceStatus.Resolved
          ? new Date()
          : previous?.value;

      if (
        [ResourceStatus.Resolved, ResourceStatus.Error].includes(
          resource.status(),
        )
      ) {
        // When loading was finished (either successfully or failed), the progress bar starts over
        // to show time until next load.
        this.resetProgressBar$.next();
      }
      return result;
    },
  });
  private resetProgressBar$ = new Subject<void>();

  protected progressBarValue = toSignal(
    toObservable(this.pollIntervalInSeconds).pipe(
      mergeMap((pollIntervalInSeconds) =>
        timer(0, updateProgressBarInterval).pipe(
          tap((value) => {
            if (
              value * updateProgressBarInterval ===
              pollIntervalInSeconds * 1000
            ) {
              this.resource().reload();
            }
          }),
          map(
            (value) =>
              ((((value + 1) * 100) / pollIntervalInSeconds) *
                updateProgressBarInterval) /
              1000,
          ),
        ),
      ),
      takeUntil(this.resetProgressBar$),
      repeat(),
    ),
  );
}
