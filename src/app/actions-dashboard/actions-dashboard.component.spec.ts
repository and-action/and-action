import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsDashboardComponent } from './actions-dashboard.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ActionsDashboardComponent', () => {
  let component: ActionsDashboardComponent;
  let fixture: ComponentFixture<ActionsDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ActionsDashboardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
