import { inject, Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { GithubDataService } from '../core/github-data.service';
import { DeployCommitEnvironment } from './deploy-commit-environment';
import {
  Commit,
  Deployment,
  DeploymentState,
} from '../commits-dashboard/commits-dashboard-models';
import { combineLatest, first, mergeMap, throwError } from 'rxjs';
import isEqual from 'lodash-es/isEqual';
import {
  CommitDeploymentsNotUpToDateError,
  CommitNotFoundError,
  CommitStatusNotSuccessfulError,
  CreateDeploymentError,
  NoEnvironmentConfigFoundError,
} from './deploy-commit-errors';
import { DeploymentType } from './deployment-type';
import { CheckStatusState } from '../core/check-status-state';
import { CheckConclusionState } from '../core/check-conclusion-state';
import { StatusWithText, StatusWithTextStatus } from '../core/status-with-text';
import { CommitState } from '../core/commit-state';
import { assertIsNotUndefinedAndNotNull } from '../assert';
import { Environment } from '../core/and-action-config';
import { AndActionDataService } from '../core/and-action-data.service';

interface LatestCommitDatePerDeployedEnvironment {
  [environment: string]: Date;
}

@Injectable({
  providedIn: 'root',
})
export class DeployCommitDialogService {
  private githubDataService = inject(GithubDataService);
  private andActionDataService = inject(AndActionDataService);

  getEnvironments(
    repositoryOwner: string,
    repositoryName: string,
    commitToDeploy: Commit,
    commits: Commit[],
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
            (environment): DeployCommitEnvironment => ({
              name: environment.name,
              deploymentType: this.getDeploymentType(
                environment.name,
                commitToDeploy,
                latestCommitDatePerDeployedEnvironment,
              ),
              deploymentState: this.getDeploymentStateForEnvironment(
                environment.name,
                commitToDeploy,
              ),
              canBeDeployed: this.canDeployEnvironment(
                environment,
                commitToDeploy,
                commits,
                latestCommitDatePerDeployedEnvironment,
              ),
              deploymentDate: this.getEnvironmentDeploymentDate(
                environment.name,
                commitToDeploy,
              ),
            }),
          ),
        ),
      );
  }

  getDeployCommitState(
    repositoryOwner: string,
    repositoryName: string,
    commitToDeploy: Commit,
    defaultBranchName: string,
  ) {
    const { id: commitId } = commitToDeploy;
    return this.githubDataService
      .loadAndActionConfigs(repositoryOwner, repositoryName)
      .pipe(
        mergeMap((andActionConfig) =>
          this.githubDataService.loadCommitState(
            commitId,
            defaultBranchName,
            andActionConfig,
          ),
        ),
        map((checkSuites): StatusWithText[] =>
          checkSuites.map((checkSuite) => {
            assertIsNotUndefinedAndNotNull(checkSuite.workflowRun?.url);
            return {
              status:
                checkSuite.status === CheckStatusState.COMPLETED &&
                checkSuite.conclusion === CheckConclusionState.SUCCESS
                  ? StatusWithTextStatus.SUCCESS
                  : checkSuite.status === CheckStatusState.COMPLETED &&
                      [
                        CheckConclusionState.ACTION_REQUIRED,
                        CheckConclusionState.CANCELLED,
                        CheckConclusionState.FAILURE,
                        CheckConclusionState.STALE,
                        CheckConclusionState.STARTUP_FAILURE,
                        CheckConclusionState.TIMED_OUT,
                        undefined,
                      ].includes(checkSuite.conclusion)
                    ? StatusWithTextStatus.FAILED
                    : StatusWithTextStatus.PENDING,
              text:
                checkSuite.workflowRun?.workflow.name ?? checkSuite.app.name,
              url: checkSuite.workflowRun?.url,
            };
          }),
        ),
        map((checkSuites): CommitState | null => {
          const [status, text] =
            checkSuites.length === 0
              ? [
                  StatusWithTextStatus.FAILED,
                  'Commit has no status checks. Commit cannot be deployed.',
                ]
              : checkSuites.some(
                    (checkSuite) =>
                      checkSuite.status === StatusWithTextStatus.FAILED,
                  )
                ? [
                    StatusWithTextStatus.FAILED,
                    'Deployment status checks failed. Commit cannot be deployed.',
                  ]
                : checkSuites.some(
                      (checkSuite) =>
                        checkSuite.status === StatusWithTextStatus.PENDING,
                    )
                  ? [
                      StatusWithTextStatus.PENDING,
                      'Deployment status checks pending. Commit cannot be deployed.',
                    ]
                  : [
                      StatusWithTextStatus.SUCCESS,
                      'Deployment status checks are successful. Commit can be deployed.',
                    ];

          return {
            status,
            text,
            url: commitToDeploy.commitUrl,
            checkSuites,
          };
        }),
      );
  }

  deployToEnvironment(
    repositoryOwner: string,
    repositoryName: string,
    defaultBranchName: string,
    commitToDeploy: Commit,
    environmentName: string,
    environments: DeployCommitEnvironment[],
  ) {
    const { id: commitId, oid: commitOid } = commitToDeploy;
    const isCurrentEnvironments$ = this.githubDataService
      .loadRepositoryCommits(
        repositoryOwner,
        repositoryName,
        this.andActionDataService.commitsDashboardConfig.commitsHistoryCount,
      )
      .pipe(
        mergeMap((repository) => {
          const refetchedCommitToDeploy = repository.commits.find(
            (commit) => commit.oid === commitToDeploy.oid,
          );
          if (refetchedCommitToDeploy) {
            return this.getEnvironments(
              repositoryOwner,
              repositoryName,
              refetchedCommitToDeploy,
              repository.commits,
            );
          } else {
            throw new CommitNotFoundError();
          }
        }),
        map((currentEnvironments) =>
          isEqual(environments, currentEnvironments),
        ),
      );

    return combineLatest([
      this.githubDataService
        .loadAndActionConfigs(repositoryOwner, repositoryName)
        .pipe(
          mergeMap((andActionConfig) =>
            this.githubDataService.isCommitStateSuccessful(
              commitId,
              defaultBranchName,
              andActionConfig,
            ),
          ),
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
          )
          .pipe(
            catchError(() => throwError(() => new CreateDeploymentError())),
          );
      }),
      first(), // make observable complete
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
          {},
        );

    return commits
      .filter((commit) =>
        commit.deployments.some(
          (deployment) => deployment.state === DeploymentState.ACTIVE,
        ),
      )
      .reduce(
        (cum, commit) => ({
          ...cum,
          ...getActiveDeploymentsAndCommitDates(commit),
        }),
        {},
      );
  }

  private isDeploymentInProgressForCommit(
    environmentName: string,
    commit: Commit,
  ) {
    const environmentDeploymentState = this.getDeploymentStateForEnvironment(
      environmentName,
      commit,
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
    commits: Commit[],
  ) {
    return commits.some((commit) =>
      this.isDeploymentInProgressForCommit(environmentName, commit),
    );
  }

  private canDeployEnvironment(
    environment: Environment,
    commitToDeploy: Commit,
    commits: Commit[],
    latestCommitDatePerDeployedEnvironment: LatestCommitDatePerDeployedEnvironment,
  ): { value: true } | { value: false; reason: string } {
    const environmentName = environment.name;

    if (this.isDeploymentInProgressForEnvironment(environmentName, commits)) {
      return {
        value: false,
        reason: `Deployment for <strong>${environmentName}</strong> is currently in progress.`,
      };
    }

    if ((environment.requires?.length ?? 0) === 0) {
      return { value: true };
    }

    switch (
      this.getDeploymentType(
        environmentName,
        commitToDeploy,
        latestCommitDatePerDeployedEnvironment,
      )
    ) {
      case DeploymentType.FORWARD:
        return this.canDeployForwardCommit(
          environment,
          commitToDeploy,
          latestCommitDatePerDeployedEnvironment,
        );
      case DeploymentType.ROLLBACK:
        return this.canDeployRollbackCommit(environment, commitToDeploy);
      default:
        return { value: false, reason: 'Unknown deployment type.' };
    }
  }

  private canDeployCommit(
    environment: Environment,
    commitToDeploy: Commit,
    checkRequiredEnvironmentState: (
      deploymentState: DeploymentState,
      requiredEnvironmentName: string,
    ) => boolean,
  ) {
    const value =
      environment.requires
        ?.map((requiredEnvironmentName) => {
          const deployment = this.getLatestEnvironmentDeployForCommit(
            requiredEnvironmentName,
            commitToDeploy.deployments,
          );

          return deployment
            ? checkRequiredEnvironmentState(
                deployment.state,
                requiredEnvironmentName,
              )
            : false;
        })
        .every(
          (isRequiredEnvironmentDeployed) => isRequiredEnvironmentDeployed,
        ) ?? true;

    const requiredEnvironmentNames = environment.requires
      ?.map(
        (requiredEnvironmentName) =>
          `<strong>${requiredEnvironmentName}</strong>`,
      )
      .join(', ');

    return value
      ? { value }
      : {
          value,
          reason: `Deploy is not possible before ${requiredEnvironmentNames} is deployed.`,
        };
  }

  private canDeployForwardCommit(
    environment: Environment,
    commitToDeploy: Commit,
    latestCommitDatePerDeployedEnvironment: LatestCommitDatePerDeployedEnvironment,
  ) {
    const checkRequiredEnvironmentState = (
      deploymentState: DeploymentState,
      requiredEnvironmentName: string,
    ) =>
      deploymentState === DeploymentState.ACTIVE ||
      (deploymentState === DeploymentState.INACTIVE &&
        latestCommitDatePerDeployedEnvironment[requiredEnvironmentName] >
          commitToDeploy.committedDate);

    return this.canDeployCommit(
      environment,
      commitToDeploy,
      checkRequiredEnvironmentState,
    );
  }

  private canDeployRollbackCommit(
    environment: Environment,
    commitToDeploy: Commit,
  ) {
    const checkRequiredEnvironmentState = (deploymentState: DeploymentState) =>
      deploymentState === DeploymentState.ACTIVE;

    return this.canDeployCommit(
      environment,
      commitToDeploy,
      checkRequiredEnvironmentState,
    );
  }

  private getDeploymentStateForEnvironment(
    environmentName: string,
    commitToDeploy: Commit,
  ) {
    return this.getLatestEnvironmentDeployForCommit(
      environmentName,
      commitToDeploy.deployments,
    )?.state;
  }

  private getEnvironmentDeploymentDate(
    environmentName: string,
    commitToDeploy: Commit,
  ) {
    return this.getLatestEnvironmentDeployForCommit(
      environmentName,
      commitToDeploy.deployments,
    )?.timestamp;
  }

  private getLatestEnvironmentDeployForCommit(
    environmentName: string,
    deployments: Deployment[],
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
    latestCommitDatePerDeployedEnvironment: LatestCommitDatePerDeployedEnvironment,
  ) {
    return latestCommitDatePerDeployedEnvironment[environmentName] &&
      commitToDeploy.committedDate <
        latestCommitDatePerDeployedEnvironment[environmentName]
      ? DeploymentType.ROLLBACK
      : DeploymentType.FORWARD;
  }
}
