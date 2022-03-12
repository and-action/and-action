import { Component, Input } from '@angular/core';
import {
  Commit,
  Deployment,
  DeploymentState,
  deploymentStateOutputTextMapping,
} from '../commits-dashboard/commits-dashboard-models';
import { DatePipe } from '@angular/common';
import { StatusTagStatus } from '../status-tag/status-tag-status';
import { StatusTagColor } from '../status-tag/status-tag-color';

const maxCommitMessageLength = 100;

@Component({
  selector: 'ana-commits-list',
  templateUrl: './commits-list.component.html',
  styleUrls: ['./commits-list.component.scss'],
})
export class CommitsListComponent {
  @Input() repositoryUrl?: string;

  private myCommits: Commit[] = [];

  private environmentColorMapping: {
    [environment: string]: StatusTagColor;
  } = {};

  get commits() {
    return this.myCommits;
  }

  @Input() set commits(commits: Commit[]) {
    this.myCommits = commits;
    this.createDeploymentEnvironmentCssClassMapping();
  }

  getCommitMessage(commitMessage: string) {
    return this.highlightTicketNumber(this.addLineBreaks(commitMessage));
  }

  getAbbreviatedCommitMessage(commitMessage: string) {
    if (commitMessage.length > maxCommitMessageLength) {
      commitMessage = `${commitMessage.substr(0, maxCommitMessageLength)}...`;
    }
    const message = this.getCommitMessage(commitMessage);
    return message.split('\n')[0];
  }

  getCommitMessageTooltip(commitMessage: string) {
    return commitMessage.includes('\n') ||
      commitMessage.length > maxCommitMessageLength
      ? this.getCommitMessage(commitMessage)
      : null;
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

  private createDeploymentEnvironmentCssClassMapping() {
    const environments = this.commits.flatMap((commit) =>
      commit.deployments.flatMap((deployment) => deployment.environment)
    );

    const set = new Set(environments);
    let index = 0;
    const colors = [
      StatusTagColor.GREEN,
      StatusTagColor.YELLOW,
      StatusTagColor.BLUE,
      StatusTagColor.RED,
      StatusTagColor.GRAY,
    ];

    set.forEach((environment) => {
      this.environmentColorMapping[environment] = colors[index % colors.length];
      index += 1;
    });
  }

  private highlightTicketNumber(commitMessage: string) {
    const match = /MD-[0-9]{4}/.exec(commitMessage);
    return match
      ? commitMessage.replace(
          match[0],
          `<span class="u-text-bold u-nowrap">${match[0]}</span>`
        )
      : commitMessage;
  }

  private addLineBreaks(commitMessage: string) {
    return commitMessage.replace(/\//g, '/<wbr>');
  }
}
