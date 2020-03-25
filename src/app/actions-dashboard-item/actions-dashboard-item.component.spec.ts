import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsDashboardItemComponent } from './actions-dashboard-item.component';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GithubDataService } from '../core/github-data.service';
import { of } from 'rxjs';
import { WorkflowRunStatus } from '../core/workflow-run-status';
import { WorkflowRunConclusion } from '../core/workflow-run-conclusion';
import { Repository } from '../core/repository';

describe('ActionsDashboardItemComponent', () => {
  let component: ActionsDashboardItemComponent;
  let fixture: ComponentFixture<ActionsDashboardItemComponent>;

  const repositoryMock: Repository = {
    name: 'repo',
    nameWithOwner: 'owner/repo',
    description: '',
    isPrivate: false,
    defaultBranchRef: { name: '' },
    url: 'https://github.com/owner/repo'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule, HttpClientTestingModule],
      declarations: [ActionsDashboardItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    const githubDataService = TestBed.inject(GithubDataService);
    spyOn(githubDataService, 'loadDefaultBranchWorkflowRuns').and.returnValue(
      of([
        {
          workflow: {
            id: 1,
            node_id: 'a',
            name: 'Reponame',
            path: 'owner/repo',
            state: '',
            created_at: '',
            updated_at: '',
            url: '',
            html_url: '',
            badge_url: ''
          },
          workflowRuns: [
            {
              id: 1,
              run_number: 1,
              status: WorkflowRunStatus.COMPLETED,
              conclusion: WorkflowRunConclusion.SUCCESS,
              created_at: '',
              updated_at: '',
              html_url: ''
            }
          ]
        }
      ])
    );
    fixture = TestBed.createComponent(ActionsDashboardItemComponent);
    component = fixture.componentInstance;
    component.repository = repositoryMock;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
