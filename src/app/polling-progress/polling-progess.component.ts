import { Component, effect, input, ResourceRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, repeat, Subject, timer } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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

  protected lastUpdate = signal<Date | undefined>(undefined);

  protected progressBarValue$?: Observable<number>;
  private resetProgressBar$ = new Subject<void>();

  constructor() {
    effect(() => {
      const updateProgressBarInterval = 200;
      const pollIntervalInSeconds = this.pollIntervalInSeconds();

      this.progressBarValue$ = timer(0, updateProgressBarInterval).pipe(
        tap(() => {
          if (this.secondsSinceLastUpdate() >= pollIntervalInSeconds) {
            this.resource().reload();
          }
        }),
        map(
          () => (100 / pollIntervalInSeconds) * this.secondsSinceLastUpdate(),
        ),
        takeUntil(this.resetProgressBar$),
        repeat(),
      );
    });

    effect(() => {
      // When resource loaded new data successfully, update timestamp of last update.
      if (this.resource().status() === 'resolved') {
        this.lastUpdate.set(new Date());
      }

      // When loading was finished (either successfully or failed), the progress bar starts over
      // to show time until next load.
      if (['resolved', 'error'].includes(this.resource().status())) {
        this.resetProgressBar$.next();
      }
    });
  }

  private secondsSinceLastUpdate() {
    const lastUpdate = this.lastUpdate();
    return lastUpdate
      ? (new Date().getTime() - lastUpdate.getTime()) / 1000
      : 0;
  }
}
