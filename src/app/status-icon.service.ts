import { Injectable } from '@angular/core';
import { GithubViewer } from './core/github-viewer';
import { Organization } from './core/organization';
import { WorkflowRunStatus } from './core/workflow-run-status';
import { WorkflowRunConclusion } from './core/workflow-run-conclusion';
import { WorkflowRun } from './core/workflow-run';
import { ElectronService } from './core/electron.service';
import { IpcChannel } from '../../ipc-channel';
import { StatusIconStatus } from '../../status-icon-status';

@Injectable({
  providedIn: 'root'
})
export class StatusIconService {
  private favicon16?: HTMLElement;
  private favicon32?: HTMLElement;

  constructor(private electronService: ElectronService) {}

  initFavicons() {
    this.favicon16 = this.appendIconToHead(16);
    this.favicon32 = this.appendIconToHead(32);
  }

  updateStatusIcon(viewerAndOrganizations: (GithubViewer | Organization)[]) {
    const workflowRuns = viewerAndOrganizations
      .flatMap(organization => organization.repositories)
      .flatMap(repository => repository.workflowsWithWorkflowRuns)
      .flatMap(workflow => workflow.workflowRuns[0])
      .filter(workflowRun => !!workflowRun);

    const status = this.hasWorkflowRunsWithError(workflowRuns)
      ? StatusIconStatus.FAILURE
      : this.hasWorkflowRunsInProgress(workflowRuns)
      ? StatusIconStatus.IN_PROGRESS
      : this.allWorkflowRunsSuccessful(workflowRuns)
      ? StatusIconStatus.SUCCESS
      : StatusIconStatus.NONE;

    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send(
        IpcChannel.SET_TRAY_ICON_STATUS,
        status
      );
    } else {
      this.favicon16.setAttribute(
        'href',
        this.getFaviconFileNameForStatus(16, status)
      );
      this.favicon32.setAttribute(
        'href',
        this.getFaviconFileNameForStatus(32, status)
      );
    }
  }

  private hasWorkflowRunsWithError(workflowRuns: WorkflowRun[]) {
    const errorConclusions = [
      WorkflowRunConclusion.FAILURE,
      WorkflowRunConclusion.CANCELLED,
      WorkflowRunConclusion.TIMED_OUT
    ];

    return workflowRuns.some(
      workflowRun =>
        workflowRun.status === WorkflowRunStatus.COMPLETED &&
        errorConclusions.includes(workflowRun.conclusion)
    );
  }

  private hasWorkflowRunsInProgress(workflowRuns: WorkflowRun[]) {
    return workflowRuns.some(
      workflowRun =>
        workflowRun.status === WorkflowRunStatus.QUEUED ||
        workflowRun.status === WorkflowRunStatus.IN_PROGRESS
    );
  }

  private allWorkflowRunsSuccessful(workflowRuns: WorkflowRun[]) {
    const successConclusions = [
      WorkflowRunConclusion.SUCCESS,
      WorkflowRunConclusion.NEUTRAL,
      WorkflowRunConclusion.ACTION_REQUIRED
    ];
    return workflowRuns.every(
      workflowRun =>
        workflowRun.status === WorkflowRunStatus.COMPLETED &&
        successConclusions.includes(workflowRun.conclusion)
    );
  }

  private appendIconToHead(size: number) {
    const element = document.createElement('link');
    const attributes = {
      rel: 'icon',
      href: `assets/favicons/${size}x${size}.png`,
      size: `${size}x${size}`,
      type: 'image/png'
    };

    Object.keys(attributes).forEach(key =>
      element.setAttribute(key, attributes[key])
    );

    if (document && document.head) {
      document.head.appendChild(element);
      return element;
    }
  }

  private getFaviconFileNameForStatus(size: number, status: StatusIconStatus) {
    const iconFileNameSuffix =
      status === StatusIconStatus.SUCCESS
        ? '-success.png'
        : status === StatusIconStatus.IN_PROGRESS
        ? '-in-progress.png'
        : status === StatusIconStatus.FAILURE
        ? '-failure.png'
        : '.png';

    return `assets/favicons/${size}x${size}${iconFileNameSuffix}`;
  }
}
