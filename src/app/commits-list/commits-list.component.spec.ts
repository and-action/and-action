import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitsListComponent } from './commits-list.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

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
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
