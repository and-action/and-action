import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActionsDashboardItemComponent } from './actions-dashboard-item.component';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Repository } from '../core/repository';

describe('ActionsDashboardItemComponent', () => {
  let component: ActionsDashboardItemComponent;
  let fixture: ComponentFixture<ActionsDashboardItemComponent>;

  const repositoryMock: Repository = {
    name: 'repo',
    owner: { login: 'owner' },
    nameWithOwner: 'owner/repo',
    description: '',
    isPrivate: false,
    defaultBranchRef: { name: '' },
    url: 'https://github.com/owner/repo',
    parent: null,
    workflowsWithWorkflowRuns: [],
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule, HttpClientTestingModule],
      declarations: [ActionsDashboardItemComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsDashboardItemComponent);
    component = fixture.componentInstance;
    component.repository = repositoryMock;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
