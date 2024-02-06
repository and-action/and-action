import { Component, Input } from '@angular/core';
import { Repository } from '../core/repository';
import { WorkflowRun } from '../core/workflow-run';
import { WorkflowRunStatus } from '../core/workflow-run-status';
import { StatusTagColor } from '../status-tag/status-tag-color';
import { WorkflowRunConclusion } from '../core/workflow-run-conclusion';
import { StatusTagStatus } from '../status-tag/status-tag-status';
import { AppRouting } from '../app-routing';
import { RouterModule } from '@angular/router';

import { StatusTagComponent } from '../status-tag/status-tag.component';

@Component({
  standalone: true,
  imports: [RouterModule, StatusTagComponent],
  selector: 'ana-actions-dashboard-item',
  templateUrl: './actions-dashboard-item.component.html',
  styleUrl: './actions-dashboard-item.component.scss',
})
export class ActionsDashboardItemComponent {
  @Input({ required: true }) repository?: Repository;

  protected appRouting = AppRouting;

  getStatusTagStatus(workflowRun?: WorkflowRun) {
    return workflowRun
      ? this.getStatusByWorkflowRunStatus(
          workflowRun.status,
          workflowRun.conclusion,
        )
      : StatusTagStatus.NONE;
  }

  getStatusTagColor(workflowRun?: WorkflowRun) {
    return {
      [StatusTagStatus.NONE]: StatusTagColor.NONE,
      [StatusTagStatus.SUCCESS]: StatusTagColor.SUCCESS,
      [StatusTagStatus.ERROR]: StatusTagColor.ERROR,
      [StatusTagStatus.IN_PROGRESS]: StatusTagColor.IN_PROGRESS,
      [StatusTagStatus.WAITING]: StatusTagColor.WAITING,
      [StatusTagStatus.SKIPPED]: StatusTagColor.SKIPPED,
    }[this.getStatusTagStatus(workflowRun)];
  }

  private getStatusByCompletedWorkflowRunConclusion(
    conclusion: WorkflowRunConclusion,
  ) {
    return {
      [WorkflowRunConclusion.SUCCESS]: StatusTagStatus.SUCCESS,
      [WorkflowRunConclusion.FAILURE]: StatusTagStatus.ERROR,
      [WorkflowRunConclusion.NEUTRAL]: StatusTagStatus.NONE,
      [WorkflowRunConclusion.CANCELLED]: StatusTagStatus.ERROR,
      [WorkflowRunConclusion.TIMED_OUT]: StatusTagStatus.ERROR,
      [WorkflowRunConclusion.SKIPPED]: StatusTagStatus.SKIPPED,
      [WorkflowRunConclusion.ACTION_REQUIRED]: StatusTagStatus.WAITING,
    }[conclusion];
  }

  private getStatusByWorkflowRunStatus(
    status: WorkflowRunStatus,
    conclusion: WorkflowRunConclusion,
  ) {
    return status === WorkflowRunStatus.COMPLETED
      ? this.getStatusByCompletedWorkflowRunConclusion(conclusion)
      : {
          [WorkflowRunStatus.QUEUED]: StatusTagStatus.WAITING,
          [WorkflowRunStatus.IN_PROGRESS]: StatusTagStatus.IN_PROGRESS,
        }[status];
  }
}
