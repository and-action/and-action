import { inject, Injectable } from '@angular/core';
import { catchError, delay, map } from 'rxjs/operators';
import { GithubDataService } from '../core/github-data.service';
import { DeployCommitEnvironment } from './deploy-commit-environment';
import {
  Commit,
  Deployment,
  DeploymentState,
} from '../commits-dashboard/commits-dashboard-models';
import { combineLatest, first, mergeMap, tap, throwError } from 'rxjs';
import isEqual from 'lodash-es/isEqual';
import {
  CommitDeploymentsNotUpToDateError,
  CommitNotFoundError,
  CommitStatusNotSuccessfulError,
  CreateDeploymentError,
  NoEnvironmentConfigFoundError,
} from './deploy-commit-errors';
import { DeploymentType } from './deployment-type';

interface LatestCommitDatePerDeployedEnvironment {
  [environment: string]: Date;
}

@Injectable({
  providedIn: 'root',
})
export class DeployCommitDialogService {
  private githubDataService = inject(GithubDataService);

  getEnvironments(
    repositoryOwner: string,
    repositoryName: string,
    commitToDeploy: Commit,
    commits: Commit[]
  ) {
    const latestCommitDatePerDeployedEnvironment: LatestCommitDatePerDeployedEnvironment =
      this.getLatestCommitDatePerDeployedEnvironment(commits);

    return this.githubDataService
      .loadAndActionConfigs(repositoryOwner, repositoryName)
      .pipe(
        map((config) => {
          if (!config.deployment?.environments) {
            throw new NoEnvironmentConfigFoundError();
          }
          return config.deployment.environments;
        }),
        map((environments) =>
          environments.map(
            (environmentName, index): DeployCommitEnvironment => ({
              name: environmentName,
              deploymentType: this.getDeploymentType(
                environmentName,
                commitToDeploy,
                latestCommitDatePerDeployedEnvironment
              ),
              deploymentState: this.getDeploymentStateForEnvironment(
                environmentName,
                commitToDeploy
              ),
              canBeDeployed: this.canDeployEnvironment(
                environments,
                index,
                commitToDeploy,
                commits,
                latestCommitDatePerDeployedEnvironment
              ),
              deploymentDate: this.getEnvironmentDeploymentDate(
                environmentName,
                commitToDeploy
              ),
            })
          )
        )
      );
  }

  deployToEnvironment(
    repositoryOwner: string,
    repositoryName: string,
    commitToDeploy: Commit,
    environmentName: string,
    deploymentType: DeploymentType,
    environments: DeployCommitEnvironment[]
  ) {
    const { id: commitId, oid: commitOid } = commitToDeploy;
    const isCurrentEnvironments$ = this.githubDataService
      .loadRepositoryCommits(repositoryOwner, repositoryName)
      .pipe(
        mergeMap((repository) => {
          const refetchedCommitToDeploy = repository.commits.find(
            (commit) => commit.oid === commitToDeploy.oid
          );
          if (refetchedCommitToDeploy) {
            return this.getEnvironments(
              repositoryOwner,
              repositoryName,
              refetchedCommitToDeploy,
              repository.commits
            );
          } else {
            throw new CommitNotFoundError();
          }
        }),
        map((currentEnvironments) => isEqual(environments, currentEnvironments))
      );

    return combineLatest([
      this.githubDataService
        .loadAndActionConfigs(repositoryOwner, repositoryName)
        .pipe(
          mergeMap((andActionConfig) =>
            this.githubDataService.loadCommitState(commitId, andActionConfig)
          )
        ),

      isCurrentEnvironments$,
    ]).pipe(
      mergeMap(([isCommitStatusSuccess, isCurrentEnvironments]) => {
        if (!isCommitStatusSuccess) {
          throw new CommitStatusNotSuccessfulError();
        }

        if (!isCurrentEnvironments) {
          throw new CommitDeploymentsNotUpToDateError();
        }

        return this.githubDataService
          .createDeployment(
            repositoryOwner,
            repositoryName,
            commitOid,
            environmentName,
            deploymentType
          )
          .pipe(
            delay(2000),
            tap(() =>
              this.githubDataService.loadRepositoryCommits(
                repositoryOwner,
                repositoryName
              )
            ),
            catchError(() => throwError(() => new CreateDeploymentError()))
          );
      }),
      first() // make observable complete
    );
  }

  private getLatestCommitDatePerDeployedEnvironment(commits: Commit[]) {
    const getActiveDeploymentsAndCommitDates = (commit: Commit) =>
      commit.deployments
        .filter((deployment) => deployment.state === DeploymentState.ACTIVE)
        .reduce(
          (cum, deployment) => ({
            ...cum,
            [deployment.environment]: commit.committedDate,
          }),
          {}
        );

    return commits
      .filter((commit) =>
        commit.deployments.some(
          (deployment) => deployment.state === DeploymentState.ACTIVE
        )
      )
      .reduce(
        (cum, commit) => ({
          ...cum,
          ...getActiveDeploymentsAndCommitDates(commit),
        }),
        {}
      );
  }

  private isDeploymentInProgressForCommit(
    environmentName: string,
    commit: Commit
  ) {
    const environmentDeploymentState = this.getDeploymentStateForEnvironment(
      environmentName,
      commit
    );

    return (
      !!environmentDeploymentState &&
      [
        DeploymentState.QUEUED,
        DeploymentState.PENDING,
        DeploymentState.IN_PROGRESS,
        DeploymentState.WAITING,
      ].includes(environmentDeploymentState)
    );
  }

  private isDeploymentInProgressForEnvironment(
    environmentName: string,
    commits: Commit[]
  ) {
    return commits.some((commit) =>
      this.isDeploymentInProgressForCommit(environmentName, commit)
    );
  }

  private canDeployEnvironment(
    environmentNames: string[],
    environmentIndex: number,
    commitToDeploy: Commit,
    commits: Commit[],
    latestCommitDatePerDeployedEnvironment: LatestCommitDatePerDeployedEnvironment
  ): { value: true } | { value: false; reason: string } {
    const environmentName = environmentNames[environmentIndex];
    const previousEnvironmentName = environmentNames[environmentIndex - 1];

    if (this.isDeploymentInProgressForEnvironment(environmentName, commits)) {
      return {
        value: false,
        reason: `Deployment for <strong>${environmentName}</strong> is currently in progress.`,
      };
    }

    if (environmentIndex === 0) {
      return { value: true };
    }

    switch (
      this.getDeploymentType(
        environmentName,
        commitToDeploy,
        latestCommitDatePerDeployedEnvironment
      )
    ) {
      case DeploymentType.FORWARD:
        return this.canDeployForwardCommit(
          previousEnvironmentName,
          commitToDeploy,
          latestCommitDatePerDeployedEnvironment
        );
      case DeploymentType.ROLLBACK: {
        const value =
          this.getDeploymentStateForEnvironment(
            previousEnvironmentName,
            commitToDeploy
          ) === DeploymentState.ACTIVE;
        return value
          ? { value }
          : {
              value,
              reason: `Deploy is not possible before <strong>${previousEnvironmentName}</strong> is deployed.`,
            };
      }
      case DeploymentType.REDEPLOY:
        return { value: true };
      default:
        return { value: false, reason: 'Unknown deployment type.' };
    }
  }

  private canDeployForwardCommit(
    previousEnvironmentName: string,
    commitToDeploy: Commit,
    latestCommitDatePerDeployedEnvironment: LatestCommitDatePerDeployedEnvironment
  ) {
    const deployment = this.getLatestEnvironmentDeployForCommit(
      previousEnvironmentName,
      commitToDeploy.deployments
    );
    const value = deployment
      ? deployment.state === DeploymentState.ACTIVE ||
        (deployment.state === DeploymentState.INACTIVE &&
          latestCommitDatePerDeployedEnvironment[previousEnvironmentName] >
            commitToDeploy.committedDate)
      : false;
    return value
      ? { value }
      : {
          value,
          reason: `Deploy is not possible before <strong>${previousEnvironmentName}</strong> is deployed.`,
        };
  }

  private getDeploymentStateForEnvironment(
    environmentName: string,
    commitToDeploy: Commit
  ) {
    return this.getLatestEnvironmentDeployForCommit(
      environmentName,
      commitToDeploy.deployments
    )?.state;
  }

  private getEnvironmentDeploymentDate(
    environmentName: string,
    commitToDeploy: Commit
  ) {
    return this.getLatestEnvironmentDeployForCommit(
      environmentName,
      commitToDeploy.deployments
    )?.timestamp;
  }

  private getLatestEnvironmentDeployForCommit(
    environmentName: string,
    deployments: Deployment[]
  ) {
    const deploymentsForEnvironment = deployments
      .filter((deployment) => deployment.environment === environmentName)
      // Sort by timestamp descending
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return deploymentsForEnvironment.length > 0
      ? deploymentsForEnvironment[0]
      : null;
  }

  private getDeploymentType(
    environmentName: string,
    commitToDeploy: Commit,
    latestCommitDatePerDeployedEnvironment: LatestCommitDatePerDeployedEnvironment
  ) {
    if (
      this.getDeploymentStateForEnvironment(environmentName, commitToDeploy) ===
        DeploymentState.ACTIVE ||
      this.isDeploymentInProgressForCommit(environmentName, commitToDeploy)
    ) {
      return DeploymentType.REDEPLOY;
    } else if (
      !latestCommitDatePerDeployedEnvironment[environmentName] ||
      commitToDeploy.committedDate >
        latestCommitDatePerDeployedEnvironment[environmentName]
    ) {
      return DeploymentType.FORWARD;
    } else if (
      latestCommitDatePerDeployedEnvironment[environmentName] &&
      commitToDeploy.committedDate <
        latestCommitDatePerDeployedEnvironment[environmentName]
    ) {
      return DeploymentType.ROLLBACK;
    }
    throw new Error('Unknown deployment type');
  }
}
