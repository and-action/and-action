import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsDashboardItemComponent } from './actions-dashboard-item.component';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Repository } from '../core/repository';
import { RouterTestingModule } from '@angular/router/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('ActionsDashboardItemComponent', () => {
  let component: ActionsDashboardItemComponent;
  let fixture: ComponentFixture<ActionsDashboardItemComponent>;

  const repositoryMock: Repository = {
    id: 'R_123',
    name: 'repo',
    owner: { login: 'owner' },
    nameWithOwner: 'owner/repo',
    description: '',
    isPrivate: false,
    isArchived: false,
    defaultBranchRef: { name: '' },
    url: 'https://github.com/owner/repo',
    parent: null,
    workflowsWithWorkflowRuns: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule, RouterTestingModule],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsDashboardItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('repository', repositoryMock);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
