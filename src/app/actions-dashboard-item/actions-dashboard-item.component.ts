import { Component, Input, OnInit } from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { Repository } from '../core/repository';
import { WorkflowWithWorkflowRuns } from '../core/workflow';
import { EMPTY, Observable, timer } from 'rxjs';
import { WorkflowRun } from '../core/workflow-run';
import { WorkflowRunStatus } from '../core/workflow-run-status';
import { catchError, flatMap, retry } from 'rxjs/operators';

@Component({
  selector: 'ana-actions-dashboard-item',
  templateUrl: './actions-dashboard-item.component.html',
  styleUrls: ['./actions-dashboard-item.component.scss']
})
export class ActionsDashboardItemComponent implements OnInit {
  @Input() repository?: Repository;

  workflowsWithWorkflowRuns$: Observable<WorkflowWithWorkflowRuns[]>;

  constructor(private githubDataService: GithubDataService) {}

  ngOnInit() {
    const _2MinutesInMillis = 2 * 60 * 1000;
    const retryCount = 3;
    this.workflowsWithWorkflowRuns$ = timer(0, _2MinutesInMillis).pipe(
      flatMap(() =>
        this.githubDataService
          .loadDefaultBranchWorkflowRuns(this.repository)
          .pipe(
            retry(retryCount),
            // TODO: log error on sentry
            catchError(() => EMPTY)
          )
      )
    );
  }

  getTagClasses(workflowRun?: WorkflowRun) {
    const classModifier = !workflowRun
      ? 'none'
      : workflowRun.status === WorkflowRunStatus.COMPLETED
      ? workflowRun.conclusion
      : workflowRun.status;

    return ['u-tag', `u-tag--${classModifier}`];
  }
}
