import { Component, OnInit } from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { combineLatest, Observable } from 'rxjs';
import {
  Commit,
  Deployment,
  RepositoryWithCommits,
} from './commits-dashboard-models';
import { map, mergeMap, tap } from 'rxjs/operators';

// const COLORS = ['#00C853', '#FFD600', '#0091EA', '#AB435C', '#484853'];

const LIGHT_COLORS = [
  'rgba(0, 200, 83, 0.2)',
  'rgba(255, 214, 0, 0.2)',
  'rgba(0, 145, 234, 0.2)',
  'rgba(171, 67, 92, 0.2)',
  'rgba(72, 72, 83, 0.2)',
];

@Component({
  selector: 'ana-commits-dashboard',
  templateUrl: './commits-dashboard.component.html',
  styleUrls: ['./commits-dashboard.component.scss'],
})
export class CommitsDashboardComponent implements OnInit {
  repositories$?: Observable<RepositoryWithCommits[]>;

  private environmentColorIndexMapping: {
    [environment: string]: number;
  } = {};

  constructor(private githubDataService: GithubDataService) {}

  ngOnInit(): void {
    this.repositories$ = this.githubDataService
      .loadOrganizationsWithSelectedRepositories()
      .pipe(
        map((organizations) =>
          organizations.flatMap((organization) => organization.repositories)
        ),
        mergeMap((repositories) =>
          combineLatest(
            repositories.map((repository) =>
              this.githubDataService.loadRepositoryCommits(
                repository.owner.login,
                repository.name
              )
            )
          )
        ),
        tap((repositories) =>
          this.createDeploymentEnvironmentCssClassMapping(repositories)
        )
      );
  }

  getColorIndexForEnvironment(environment: string) {
    return this.environmentColorIndexMapping[environment];
  }

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

  getDeploymentTagCssClasses(deployment: Deployment) {
    return [
      'u-tag',
      `u-tag--color-${this.getColorIndexForEnvironment(
        deployment.environment
      )}`,
      ...(deployment.isLatestDeploymentForEnvironment ? [] : ['u-tag--light']),
    ];
  }

  private createDeploymentEnvironmentCssClassMapping(
    repositories: RepositoryWithCommits[]
  ) {
    const environments = repositories.flatMap((repository) =>
      repository.commits.flatMap((commit) =>
        commit.deployments.flatMap((deployment) => deployment.environment)
      )
    );

    const set = new Set(environments);
    let index = 0;
    set.forEach((environment) => {
      this.environmentColorIndexMapping[environment] = index;
      index += 1;
    });
  }
}
