import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActionsDashboardComponent } from './actions-dashboard.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AndActionDataService } from '../core/and-action-data.service';
import { ActionsDashboardConfig } from '../core/actions-dashboard-config';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GraphQLModule } from '../graphql.module';

describe('ActionsDashboardComponent', () => {
  let component: ActionsDashboardComponent;
  let fixture: ComponentFixture<ActionsDashboardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [GraphQLModule, HttpClientTestingModule, RouterTestingModule],
        declarations: [ActionsDashboardComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    const andActionDataService = TestBed.inject(AndActionDataService);
    spyOnProperty(
      andActionDataService,
      'actionsDashboardConfig'
    ).and.returnValue(new ActionsDashboardConfig([]));

    fixture = TestBed.createComponent(ActionsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
