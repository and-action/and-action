import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommitsDashboardComponent } from './commits-dashboard.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AndActionDataService } from '../core/and-action-data.service';
import { ActionsDashboardConfig } from '../core/actions-dashboard-config';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAndActionApollo } from '../../provideApollo';
import { provideZonelessChangeDetection } from '@angular/core';

describe('CommitsDashboardComponent', () => {
  let component: CommitsDashboardComponent;
  let fixture: ComponentFixture<CommitsDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, MatSnackBarModule, RouterTestingModule],
      providers: [
        provideAndActionApollo(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    const andActionDataService = TestBed.inject(AndActionDataService);
    spyOnProperty(
      andActionDataService,
      'actionsDashboardConfig',
    ).and.returnValue(new ActionsDashboardConfig([]));

    fixture = TestBed.createComponent(CommitsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
