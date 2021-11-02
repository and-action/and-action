import { Component, Input } from '@angular/core';
import {
  Commit,
  Deployment,
} from '../commits-dashboard/commits-dashboard-models';
import { DatePipe } from '@angular/common';

const maxCommitMessageLength = 100;

@Component({
  selector: 'ana-commits-list',
  templateUrl: './commits-list.component.html',
  styleUrls: ['./commits-list.component.scss'],
})
export class CommitsListComponent {
  @Input() set commits(commits: Commit[]) {
    this.myCommits = commits;
    this.createDeploymentEnvironmentCssClassMapping();
  }

  get commits() {
    return this.myCommits;
  }

  @Input() repositoryUrl: string;

  private myCommits: Commit[];

  private environmentColorIndexMapping: {
    [environment: string]: number;
  } = {};

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

  getDeploymentTagCssClasses(deployment: Deployment) {
    return [
      'u-tag',
      'u-tag--small',
      `u-tag--color-${this.getColorIndexForEnvironment(
        deployment.environment
      )}`,
      ...(deployment.isLatestDeploymentForEnvironment ? [] : ['u-tag--light']),
    ];
  }

  getTooltipContent(deployment: Deployment) {
    const datePipe = new DatePipe('en-US');
    return `${datePipe.transform(deployment.timestamp, 'short')}
    ${deployment.creator.login} (${deployment.creator.name})
    ${deployment.state}`;
  }

  private getColorIndexForEnvironment(environment: string) {
    return this.environmentColorIndexMapping[environment];
  }

  private createDeploymentEnvironmentCssClassMapping() {
    const environments = this.commits.flatMap((commit) =>
      commit.deployments.flatMap((deployment) => deployment.environment)
    );

    const set = new Set(environments);
    let index = 0;
    set.forEach((environment) => {
      this.environmentColorIndexMapping[environment] = index;
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
