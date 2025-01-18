import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRepositoryModalComponent } from './add-repository-modal.component';
import { ApolloTestingModule } from 'apollo-angular/testing';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

describe('AddRepositoryModalComponent', () => {
  let component: AddRepositoryModalComponent;
  let fixture: ComponentFixture<AddRepositoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddRepositoryModalComponent,
        ApolloTestingModule,
        MatDialogModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddRepositoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
