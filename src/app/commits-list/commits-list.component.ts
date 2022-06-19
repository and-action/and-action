import { Component, Input } from '@angular/core';
import {
  Commit,
  Deployment,
  DeploymentState,
  deploymentStateOutputTextMapping,
  RepositoryWithCommits,
} from '../commits-dashboard/commits-dashboard-models';
import { DatePipe } from '@angular/common';
import { StatusTagStatus } from '../status-tag/status-tag-status';
import { StatusTagColor } from '../status-tag/status-tag-color';
import { MatDialog } from '@angular/material/dialog';
import { DeployCommitDialogComponent } from '../deploy-commit-dialog/deploy-commit-dialog.component';
import { getDeploymentEnvironmentColors } from '../status-tag/status-tag-utils';

@Component({
  selector: 'ana-commits-list',
  templateUrl: './commits-list.component.html',
  styleUrls: ['./commits-list.component.scss'],
})
export class CommitsListComponent {
  private myRepository?: RepositoryWithCommits;

  private environmentColorMapping: {
    [environment: string]: StatusTagColor;
  } = {};

  constructor(private dialog: MatDialog) {}

  get repository() {
    return this.myRepository;
  }

  @Input() set repository(repository: RepositoryWithCommits | undefined) {
    this.myRepository = repository;
    this.environmentColorMapping = this.getDeploymentEnvironmentColors();
  }

  getDeploymentStatusForStatusTag(deployment: Deployment) {
    return {
      [DeploymentState.ABANDONED]: StatusTagStatus.ERROR,
      [DeploymentState.ACTIVE]: StatusTagStatus.SUCCESS,
      [DeploymentState.DESTROYED]: StatusTagStatus.ERROR,
      [DeploymentState.ERROR]: StatusTagStatus.ERROR,
      [DeploymentState.FAILURE]: StatusTagStatus.ERROR,
      [DeploymentState.INACTIVE]: StatusTagStatus.SUCCESS,
      [DeploymentState.IN_PROGRESS]: StatusTagStatus.IN_PROGRESS,
      [DeploymentState.PENDING]: StatusTagStatus.WAITING,
      [DeploymentState.QUEUED]: StatusTagStatus.WAITING,
      [DeploymentState.WAITING]: StatusTagStatus.WAITING,
    }[deployment.state];
  }

  getDeploymentStatusTagColor(deployment: Deployment) {
    return this.environmentColorMapping[deployment.environment];
  }

  getTooltipContent(deployment: Deployment) {
    const datePipe = new DatePipe('en-US');
    const creatorName = deployment.creator.name
      ? ` (${deployment.creator.name})`
      : '';
    return `${datePipe.transform(deployment.timestamp, 'short')}
    ${deployment.creator.login}${creatorName}
    ${deploymentStateOutputTextMapping[deployment.state]}`;
  }

  isDeploymentActive(deployment: Deployment) {
    return deployment.state === DeploymentState.ACTIVE;
  }

  openDeployDialog(commitToDeploy: Commit, commits: Commit[]) {
    this.dialog.open(DeployCommitDialogComponent, {
      data: { repository: this.repository, commitToDeploy, commits },
      width: '600px',
    });
  }

  private getDeploymentEnvironmentColors() {
    const environments =
      this.myRepository?.commits.flatMap((commit) =>
        commit.deployments.flatMap((deployment) => deployment.environment)
      ) ?? [];
    return getDeploymentEnvironmentColors(environments);
  }
}
