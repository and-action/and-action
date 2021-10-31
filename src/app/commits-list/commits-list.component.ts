import { Component, Input } from '@angular/core';
import {
  Commit,
  Deployment,
} from '../commits-dashboard/commits-dashboard-models';
import { DatePipe } from '@angular/common';

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
    // Show moneymeets Ticket IDs with bold text.
    const match = /MD-[0-9]{4}/.exec(commitMessage);
    return match
      ? commitMessage.replace(
          match[0],
          `<span class="u-text-bold u-nowrap">${match[0]}</span>`
        )
      : commitMessage;
  }

  getAbbreviatedCommitMessage(commitMessage: string) {
    const maxCommitMessageLength = 100;
    if (commitMessage.length > maxCommitMessageLength) {
      commitMessage = `${commitMessage.substr(0, maxCommitMessageLength)}...`;
    }
    const message = this.getCommitMessage(commitMessage);
    return message.split('\n')[0];
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
}
