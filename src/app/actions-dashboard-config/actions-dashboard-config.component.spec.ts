import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActionsDashboardConfigComponent } from './actions-dashboard-config.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AndActionDataService } from '../core/and-action-data.service';
import { ActionsDashboardConfig } from '../core/actions-dashboard-config';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GraphQLModule } from '../graphql.module';

describe('ActionsDashboardConfigComponent', () => {
  let component: ActionsDashboardConfigComponent;
  let fixture: ComponentFixture<ActionsDashboardConfigComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GraphQLModule, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    const andActionDataService = TestBed.inject(AndActionDataService);
    spyOnProperty(
      andActionDataService,
      'actionsDashboardConfig',
    ).and.returnValue(new ActionsDashboardConfig([]));
    fixture = TestBed.createComponent(ActionsDashboardConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
