import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitsListComponent } from './commits-list.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('CommitsListComponent', () => {
  let component: CommitsListComponent;
  let fixture: ComponentFixture<CommitsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitsListComponent);
    fixture.componentRef.setInput('repository', undefined);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
