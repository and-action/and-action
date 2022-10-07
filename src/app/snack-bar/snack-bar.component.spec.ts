import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackBarComponent } from './snack-bar.component';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { SnackBarType } from './snack-bar-type';
import { SnackBarData } from './snack-bar-data';

describe('SnackBarComponent', () => {
  let component: SnackBarComponent;
  let fixture: ComponentFixture<SnackBarComponent>;

  const snackBarData: SnackBarData = {
    message: 'Test message',
    type: SnackBarType.INFO,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        { provide: MatSnackBarRef, useValue: { dismiss() {} } },
        { provide: MAT_SNACK_BAR_DATA, useValue: snackBarData },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
