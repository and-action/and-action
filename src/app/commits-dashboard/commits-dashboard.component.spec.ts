import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommitsDashboardComponent } from './commits-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AndActionDataService } from '../core/and-action-data.service';
import { ActionsDashboardConfig } from '../core/actions-dashboard-config';
import { FormsModule } from '@angular/forms';
import { GraphQLModule } from '../graphql.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('CommitsDashboardComponent', () => {
  let component: CommitsDashboardComponent;
  let fixture: ComponentFixture<CommitsDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GraphQLModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      declarations: [CommitsDashboardComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    const andActionDataService = TestBed.inject(AndActionDataService);
    spyOnProperty(
      andActionDataService,
      'actionsDashboardConfig'
    ).and.returnValue(new ActionsDashboardConfig([]));

    fixture = TestBed.createComponent(CommitsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
