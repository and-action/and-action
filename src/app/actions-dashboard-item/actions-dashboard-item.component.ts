import { Component, Input, OnInit } from '@angular/core';
import { Repository } from '../core/repository';
import { WorkflowRun } from '../core/workflow-run';
import { WorkflowRunStatus } from '../core/workflow-run-status';

@Component({
  selector: 'ana-actions-dashboard-item',
  templateUrl: './actions-dashboard-item.component.html',
  styleUrls: ['./actions-dashboard-item.component.scss']
})
export class ActionsDashboardItemComponent implements OnInit {
  @Input() repository?: Repository;

  constructor() {}

  ngOnInit() {}

  getTagClasses(workflowRun?: WorkflowRun) {
    const classModifier = !workflowRun
      ? 'none'
      : workflowRun.status === WorkflowRunStatus.COMPLETED
      ? workflowRun.conclusion
      : workflowRun.status;

    return ['u-tag', `u-tag--${classModifier}`];
  }
}
