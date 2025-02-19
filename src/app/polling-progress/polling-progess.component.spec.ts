import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { PollingProgessComponent } from './polling-progess.component';
import { By } from '@angular/platform-browser';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { DEFAULT_DATE_TIME_FORMAT } from '../constants';
import { resource } from '@angular/core';

describe('PollingProgressComponent', () => {
  let fixture: ComponentFixture<PollingProgessComponent<boolean>>;
  const pollInterval = 60;
  let observableEmitCount = 0;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, NoopAnimationsModule],
      providers: [
        {
          provide: DATE_PIPE_DEFAULT_OPTIONS,
          useValue: {
            dateFormat: DEFAULT_DATE_TIME_FORMAT,
          },
        },
      ],
    });

    fixture = TestBed.createComponent(PollingProgessComponent<boolean>);
    fixture.componentRef.setInput('pollIntervalInSeconds', pollInterval);

    await fixture.whenStable();
    observableEmitCount = 0;
  });

  it('should subscribe to observable in given interval and update ui', fakeAsync(() => {
    jasmine.clock().mockDate(new Date('2023-03-01T08:00:00.000'));

    TestBed.runInInjectionContext(() => {
      const testResource = resource({
        loader: () => {
          ++observableEmitCount;
          return Promise.resolve();
        },
      });
      fixture.componentRef.setInput('resource', testResource);
    });

    fixture.detectChanges();
    checkEmptyLastSubscriptionAndProgressDontExist();

    tickAndCheck(1, '8:00', 0, 1);
    tickAndCheck(15000, '8:00', 25, 1);
    tickAndCheck(15000, '8:00', 50, 1);
    tickAndCheck(15000, '8:00', 75, 1);

    tickAndCheck(15000, '8:01', 100, 2);
    tickAndCheck(1, '8:01', 0, 2);

    tickAndCheck(14999, '8:01', 25, 2);
    tickAndCheck(15000, '8:01', 50, 2);
    tickAndCheck(15000, '8:01', 75, 2);
    tickAndCheck(15000, '8:02', 100, 3);
    tickAndCheck(1, '8:02', 0, 3);

    // Async pipes subscribe to timer observables.
    // It seems that there are still timers in the queue that need to be discarded.
    discardPeriodicTasks();
  }));

  it('should keep polling on error without updating timestamp of last update', fakeAsync(() => {
    jasmine.clock().mockDate(new Date('2023-03-01T08:00:00.000'));

    TestBed.runInInjectionContext(() => {
      const testResource = resource({
        loader: () => {
          ++observableEmitCount;
          if (observableEmitCount !== 1 && observableEmitCount !== 3) {
            // return Promise.reject();
            throw new Error('Test');
          }
          return Promise.resolve();
        },
      });
      fixture.componentRef.setInput('resource', testResource);
    });

    fixture.detectChanges();

    tickAndCheck(1, '8:00', 0, 1);
    tickAndCheck(30000, '8:00', 50, 1);
    tickAndCheck(30000, '8:00', 100, 2);
    // TODO: Reload does not hit in this test. Thus, we cannot really test the error case.

    // Async pipes subscribe to timer observables.
    // It seems that there are still timers in the queue that need to be discarded.
    discardPeriodicTasks();
  }));

  function tickAndCheck(
    tickMillis: number,
    expectedTime: string | undefined,
    expectedProgressBarValue: number,
    expectedObservableEmitCount: number,
  ) {
    tick(tickMillis);
    fixture.detectChanges();
    fixture.detectChanges();

    const { lastSubscriptionElement, progressElement } = getElements();
    const expectedLastUpdate = expectedTime
      ? `Last update: 2023-03-01, ${expectedTime} AM`
      : 'Last update: -';
    expect(lastSubscriptionElement.nativeElement.textContent.trim()).toEqual(
      expectedLastUpdate,
    );
    // Math.floor is needed since values have decimal digits, probably due to the tick.
    expect(Math.floor(progressElement.componentInstance.value)).toEqual(
      expectedProgressBarValue,
    );
    expect(observableEmitCount).toEqual(expectedObservableEmitCount);
  }

  function getElements() {
    const lastSubscriptionElement = fixture.debugElement.query(
      By.css('.status__last-subscription'),
    );
    const progressElement = fixture.debugElement.query(
      By.directive(MatProgressBar),
    );
    return { lastSubscriptionElement, progressElement };
  }

  function checkEmptyLastSubscriptionAndProgressDontExist() {
    const { lastSubscriptionElement, progressElement } = getElements();
    expect(lastSubscriptionElement.nativeElement.textContent.trim()).toEqual(
      'Last update: -',
    );
    expect(Math.floor(progressElement.componentInstance.value)).toEqual(0);
  }
});
