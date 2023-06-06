import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { of, tap } from 'rxjs';

import { PollingProgessComponent } from './polling-progess.component';
import { By } from '@angular/platform-browser';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PollingProgressComponent', () => {
  let component: PollingProgessComponent;
  let fixture: ComponentFixture<PollingProgessComponent>;
  const pollInterval = 60;
  let observableEmitCount = 0;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, NoopAnimationsModule],
    });

    fixture = TestBed.createComponent(PollingProgessComponent);
    component = fixture.componentInstance;
    component.pollIntervalInSeconds = pollInterval;

    fixture.detectChanges();
    await fixture.whenStable();

    observableEmitCount = 0;
  });

  it('should subscribe to observable in given interval and update ui', fakeAsync(() => {
    jasmine.clock().mockDate(new Date('2023-03-01T08:00:00.000'));
    component.observable = of(true).pipe(tap(() => ++observableEmitCount));

    checkTextAndProgressDontExist();

    component.ngOnChanges();
    fixture.detectChanges();

    tickAndCheck(1, '8:00', 0, 1);
    tickAndCheck(15000, '8:00', 25, 1);
    tickAndCheck(15000, '8:00', 50, 1);
    tickAndCheck(15000, '8:00', 75, 1);
    tickAndCheck(15000, '8:01', 0, 2);
    tickAndCheck(15000, '8:01', 25, 2);
    tickAndCheck(15000, '8:01', 50, 2);
    tickAndCheck(15000, '8:01', 75, 2);
    tickAndCheck(15000, '8:02', 0, 3);

    // Async pipes subscribe to timer observables.
    // It seems that there are still timers in the queue that need to be discarded.
    discardPeriodicTasks();
  }));

  it('should keep polling on error', fakeAsync(() => {
    jasmine.clock().mockDate(new Date('2023-03-01T08:00:00.000'));
    component.observable = of(true).pipe(
      tap(() => {
        ++observableEmitCount;
        throw new Error('Test');
      })
    );
    component.pollIntervalInSeconds = pollInterval;

    component.ngOnChanges();
    fixture.detectChanges();

    tickAndCheck(1, '8:00', 0, 1);
    tickAndCheck(30000, '8:00', 50, 1);
    tickAndCheck(60000, '8:01', 50, 2);
    tickAndCheck(60000, '8:02', 50, 3);

    // Async pipes subscribe to timer observables.
    // It seems that there are still timers in the queue that need to be discarded.
    discardPeriodicTasks();
  }));

  function tickAndCheck(
    tickMillis: number,
    expectedTime: string,
    expectedProgressBarValue: number,
    expectedObservableEmitCount: number
  ) {
    tick(tickMillis);
    fixture.detectChanges();

    const { lastSubscriptionElement, progressElement } = getElements();
    expect(lastSubscriptionElement.nativeElement.textContent.trim()).toEqual(
      `Last update: 2023-03-01, ${expectedTime} AM`
    );
    // Math.floor is needed since values have decimal digits, probably due to the tick.
    expect(Math.floor(progressElement.componentInstance.value)).toEqual(
      expectedProgressBarValue
    );
    expect(observableEmitCount).toEqual(expectedObservableEmitCount);
  }

  function getElements() {
    const lastSubscriptionElement = fixture.debugElement.query(
      By.css('.status__last-subscription')
    );
    const progressElement = fixture.debugElement.query(
      By.directive(MatProgressBar)
    );
    return { lastSubscriptionElement, progressElement };
  }

  function checkTextAndProgressDontExist() {
    const { lastSubscriptionElement, progressElement } = getElements();
    expect(lastSubscriptionElement).toBeNull();
    expect(progressElement).toBeNull();
  }
});
