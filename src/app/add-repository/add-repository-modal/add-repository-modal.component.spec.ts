import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRepositoryModalComponent } from './add-repository-modal.component';

describe('AddRepositoryModalComponent', () => {
  let component: AddRepositoryModalComponent;
  let fixture: ComponentFixture<AddRepositoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRepositoryModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddRepositoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
