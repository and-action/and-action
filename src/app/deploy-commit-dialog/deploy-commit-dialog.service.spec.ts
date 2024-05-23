import { TestBed } from '@angular/core/testing';

import { DeployCommitDialogService } from './deploy-commit-dialog.service';
import { GraphQLModule } from '../graphql.module';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  Commit,
  Deployment,
  DeploymentState,
} from '../commits-dashboard/commits-dashboard-models';
import { DeployCommitEnvironment } from './deploy-commit-environment';
import { GithubDataService } from '../core/github-data.service';
import { of } from 'rxjs';
import { DeploymentType } from './deployment-type';
import { CheckStatusState } from '../core/check-status-state';
import { CheckConclusionState } from '../core/check-conclusion-state';
import { CommitState } from '../core/commit-state';
import { StatusWithTextStatus } from '../core/status-with-text';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DeployCommitDialogService', () => {
  let service: DeployCommitDialogService;
  let commitBefore: Commit;
  let commitToDeploy: Commit;
  let commitAfter: Commit;
  const defaultDeploymentDate = new Date('2022-06-02T09:00:00Z');

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [GraphQLModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(DeployCommitDialogService);
  });

  beforeEach(() => {
    commitBefore = getCommitMock(
      '100000',
      new Date('2022-06-01T08:00:00Z'),
      'Commit before',
      [],
    );

    commitToDeploy = getCommitMock(
      '200000',
      new Date('2022-06-02T08:00:00Z'),
      'Commit to deploy',
      [commitBefore.oid],
    );

    commitAfter = getCommitMock(
      '300000',
      new Date('2022-06-03T08:00:00Z'),
      'Commit after',
      [commitToDeploy.oid],
    );

    const githubDataService = TestBed.inject(GithubDataService);
    spyOn(githubDataService, 'loadAndActionConfigs').and.returnValue(
      of({
        deployment: {
          environments: ['dev', 'test', 'live'],
        },
      }),
    );
  });

  describe('getEnvironments()', () => {
    interface ExpectedEnvironment {
      canBeDeployed: { value: true } | { value: false; reason: string };
      deploymentType: DeploymentType;
      deploymentState?: DeploymentState;
      deploymentDate?: Date;
    }

    it(`
    should only allow deployment of first environment:
    - commit after
    - commit to deploy
    - commit before
    `, () => {
      checkExpectedEnvironments(
        deployableEnvironment(),
        nonDeployableEnvironment('dev'),
        nonDeployableEnvironment('test'),
      );
    });

    it(`
    should allow deployment of second environment if first environment is deployed:
    - commit after
    - commit to deploy *dev*
    - commit before
    `, () => {
      commitToDeploy.deployments = [activeDeployment('dev')];

      checkExpectedEnvironments(
        deployableEnvironment(DeploymentState.ACTIVE),
        deployableEnvironment(),
        nonDeployableEnvironment('test'),
      );
    });

    it(`
    should allow deployment of third environment if second environment is deployed:
    - commit after
    - commit to deploy *dev* *test*
    - commit before
    `, () => {
      commitToDeploy.deployments = [
        activeDeployment('dev'),
        activeDeployment('test'),
      ];

      checkExpectedEnvironments(
        deployableEnvironment(DeploymentState.ACTIVE),
        deployableEnvironment(DeploymentState.ACTIVE),
        deployableEnvironment(),
      );
    });

    it(`
    should allow deployment of all environments if all are actively deployed:
    - commit after
    - commit to deploy *dev* *test* *live*
    - commit before
    `, () => {
      commitToDeploy.deployments = [
        activeDeployment('dev'),
        activeDeployment('test'),
        activeDeployment('live'),
      ];

      checkExpectedEnvironments(
        deployableEnvironment(DeploymentState.ACTIVE),
        deployableEnvironment(DeploymentState.ACTIVE),
        deployableEnvironment(DeploymentState.ACTIVE),
      );
    });

    it(`
    should only allow deployment of first environment:
    - commit after
    - commit to deploy
    - commit before *dev* *test* *live*
    `, () => {
      commitBefore.deployments = [
        activeDeployment('dev'),
        activeDeployment('test'),
        activeDeployment('live'),
      ];

      checkExpectedEnvironments(
        deployableEnvironment(),
        nonDeployableEnvironment('dev'),
        nonDeployableEnvironment('test'),
      );
    });

    it(`
    should allow deployment of second environment if first environment is deployed:
    - commit after
    - commit to deploy *dev*
    - commit before dev *test* *live*
    `, () => {
      commitBefore.deployments = [
        inactiveDeployment('dev'),
        activeDeployment('test'),
        activeDeployment('live'),
      ];

      commitToDeploy.deployments = [activeDeployment('dev')];

      checkExpectedEnvironments(
        deployableEnvironment(DeploymentState.ACTIVE),
        deployableEnvironment(),
        nonDeployableEnvironment('test'),
      );
    });

    it(`
    should allow deployment of third environment if second environment is deployed:
    - commit after
    - commit to deploy *dev* *test*
    - commit before dev test *live*
    `, () => {
      commitBefore.deployments = [
        inactiveDeployment('dev'),
        inactiveDeployment('test'),
        activeDeployment('live'),
      ];

      commitToDeploy.deployments = [
        activeDeployment('dev'),
        activeDeployment('test'),
      ];

      checkExpectedEnvironments(
        deployableEnvironment(DeploymentState.ACTIVE),
        deployableEnvironment(DeploymentState.ACTIVE),
        deployableEnvironment(),
      );
    });

    it(`
    should allow deployment of all environments if all are actively deployed:
    - commit after
    - commit to deploy *dev* *test* *live*
    - commit before dev test live
    `, () => {
      commitBefore.deployments = [
        inactiveDeployment('dev'),
        inactiveDeployment('test'),
        inactiveDeployment('live'),
      ];

      commitToDeploy.deployments = [
        activeDeployment('dev'),
        activeDeployment('test'),
        activeDeployment('live'),
      ];

      checkExpectedEnvironments(
        deployableEnvironment(DeploymentState.ACTIVE),
        deployableEnvironment(DeploymentState.ACTIVE),
        deployableEnvironment(DeploymentState.ACTIVE),
      );
    });

    it(`
    should only allow rollback deployment of first environment:
    - commit after *dev* *test* *live*
    - commit to deploy dev test live
    - commit before
    `, () => {
      commitToDeploy.deployments = [
        inactiveDeployment('dev'),
        inactiveDeployment('test'),
        inactiveDeployment('live'),
      ];

      commitAfter.deployments = [
        activeDeployment('dev'),
        activeDeployment('test'),
        activeDeployment('live'),
      ];

      checkExpectedEnvironments(
        deployableRollbackEnvironment(DeploymentState.INACTIVE),
        nonDeployableRollbackEnvironment('dev', DeploymentState.INACTIVE),
        nonDeployableRollbackEnvironment('test', DeploymentState.INACTIVE),
      );
    });

    it(`
    should disallow deploy for environment if previous environment is inactive NOT having an active deployment on a later commit:
    - commit after
    - commit to deploy dev
    - commit before *dev*
    `, () => {
      commitBefore.deployments = [activeDeployment('dev')];

      commitToDeploy.deployments = [inactiveDeployment('dev')];

      checkExpectedEnvironments(
        deployableEnvironment(DeploymentState.INACTIVE),
        nonDeployableEnvironment('dev'),
        nonDeployableEnvironment('test'),
      );
    });

    it(`
    should allow deploy for environment if previous environment is inactive having an active deployment on a later commit:
    - commit after *dev*
    - commit to deploy dev
    - commit before
    `, () => {
      commitToDeploy.deployments = [inactiveDeployment('dev')];

      commitAfter.deployments = [activeDeployment('dev')];

      checkExpectedEnvironments(
        deployableRollbackEnvironment(DeploymentState.INACTIVE),
        deployableEnvironment(),
        nonDeployableEnvironment('test'),
      );
    });

    it(`
    should disallow deployment if same environment has deployment in progress for any commit:
    - commit after
    - commit to deploy
    - commit before ~dev~
    `, () => {
      const deploymentDate = new Date('2022-06-02T09:00:00Z');

      [
        DeploymentState.IN_PROGRESS,
        DeploymentState.PENDING,
        DeploymentState.QUEUED,
        DeploymentState.WAITING,
      ].forEach((deploymentState) => {
        commitBefore.deployments = [
          createDeployment('dev', deploymentDate, deploymentState),
        ];

        checkExpectedEnvironments(
          {
            canBeDeployed: {
              value: false,
              reason:
                'Deployment for <strong>dev</strong> is currently in progress.',
            },
            deploymentType: DeploymentType.FORWARD,
          },
          nonDeployableEnvironment('dev'),
          nonDeployableEnvironment('test'),
        );
      });
    });

    it(`
    should always allow deployment of active deployment:
    - commit after *dev* *test*
    - commit to deploy dev test *live*
    - commit before
    `, () => {
      commitToDeploy.deployments = [
        inactiveDeployment('dev'),
        inactiveDeployment('test'),
        activeDeployment('live'),
      ];

      commitAfter.deployments = [
        activeDeployment('dev'),
        activeDeployment('test'),
      ];

      checkExpectedEnvironments(
        deployableRollbackEnvironment(DeploymentState.INACTIVE),
        nonDeployableRollbackEnvironment('dev', DeploymentState.INACTIVE),
        deployableEnvironment(DeploymentState.ACTIVE),
      );
    });

    it(`
    should take latest deployment for environment into account:
    - commit after
    - commit to deploy dev dev *dev*
    - commit before
    `, () => {
      const oldDeploymentDate = new Date('2022-06-01T09:00:00Z');

      const firstInactiveDeployment = inactiveDeployment('dev');
      firstInactiveDeployment.timestamp = oldDeploymentDate;
      const secondInactiveDeployment = inactiveDeployment('dev');
      secondInactiveDeployment.timestamp = oldDeploymentDate;

      commitToDeploy.deployments = [
        firstInactiveDeployment,
        secondInactiveDeployment,
        activeDeployment('dev'),
      ];

      checkExpectedEnvironments(
        deployableEnvironment(DeploymentState.ACTIVE),
        deployableEnvironment(),
        nonDeployableEnvironment('test'),
      );
    });

    function createDeployment(
      environmentName: string,
      deploymentDate: Date,
      state: DeploymentState,
    ): Deployment {
      return {
        id: 'deploy-id',
        environment: environmentName,
        timestamp: deploymentDate,
        creator: { name: 'testuser', login: 'testuser' },
        state,
        logUrl: null,
      };
    }

    function activeDeployment(environmentName: string) {
      return createDeployment(
        environmentName,
        defaultDeploymentDate,
        DeploymentState.ACTIVE,
      );
    }

    function inactiveDeployment(environmentName: string) {
      return createDeployment(
        environmentName,
        defaultDeploymentDate,
        DeploymentState.INACTIVE,
      );
    }

    function deployableEnvironment(
      deploymentState?: DeploymentState,
    ): ExpectedEnvironment {
      return {
        canBeDeployed: { value: true },
        deploymentType: DeploymentType.FORWARD,
        deploymentState,
        deploymentDate: deploymentState ? defaultDeploymentDate : undefined,
      };
    }

    function nonDeployableEnvironment(
      previousEnvironmentName: string,
    ): ExpectedEnvironment {
      return {
        canBeDeployed: {
          value: false,
          reason: `Deploy is not possible before <strong>${previousEnvironmentName}</strong> is deployed.`,
        },
        deploymentType: DeploymentType.FORWARD,
      };
    }

    function deployableRollbackEnvironment(
      deploymentState?: DeploymentState,
    ): ExpectedEnvironment {
      return {
        canBeDeployed: { value: true },
        deploymentType: DeploymentType.ROLLBACK,
        deploymentState,
        deploymentDate: deploymentState ? defaultDeploymentDate : undefined,
      };
    }

    function nonDeployableRollbackEnvironment(
      previousEnvironmentName: string,
      deploymentState?: DeploymentState,
    ): ExpectedEnvironment {
      return {
        canBeDeployed: {
          value: false,
          reason: `Deploy is not possible before <strong>${previousEnvironmentName}</strong> is deployed.`,
        },
        deploymentType: DeploymentType.ROLLBACK,
        deploymentState,
        deploymentDate: deploymentState ? defaultDeploymentDate : undefined,
      };
    }

    function checkExpectedEnvironments(
      dev: ExpectedEnvironment,
      test: ExpectedEnvironment,
      live: ExpectedEnvironment,
    ) {
      const createDeployCommitEnvironment = (
        name: string,
        environment: ExpectedEnvironment,
      ): DeployCommitEnvironment => ({
        name,
        canBeDeployed: environment.canBeDeployed,
        deploymentType: environment.deploymentType,
        deploymentDate: environment.deploymentDate,
        deploymentState: environment.deploymentState,
      });

      const expected: DeployCommitEnvironment[] = [
        createDeployCommitEnvironment('dev', dev),
        createDeployCommitEnvironment('test', test),
        createDeployCommitEnvironment('live', live),
      ];
      service
        .getEnvironments('testOwner', 'testRepo', commitToDeploy, [
          commitBefore,
          commitToDeploy,
          commitAfter,
        ])
        .subscribe((environments) => expect(environments).toEqual(expected));
    }
  });

  describe('getDeployCommitState', () => {
    it('should return successful commit state correctly', () =>
      checkDeployCommitState(
        CheckStatusState.COMPLETED,
        CheckConclusionState.SUCCESS,
        StatusWithTextStatus.SUCCESS,
        'Deployment status checks are successful. Commit can be deployed.',
      ));

    it('should return failed commit state correctly', () =>
      checkDeployCommitState(
        CheckStatusState.COMPLETED,
        CheckConclusionState.FAILURE,
        StatusWithTextStatus.FAILED,
        'Deployment status checks failed. Commit cannot be deployed.',
      ));

    it('should return failed commit state correctly if no checks are present', () =>
      checkDeployCommitState(
        undefined,
        undefined,
        StatusWithTextStatus.FAILED,
        'Commit has no status checks. Commit cannot be deployed.',
      ));

    it('should return pending commit state correctly', () =>
      checkDeployCommitState(
        CheckStatusState.PENDING,
        undefined,
        StatusWithTextStatus.PENDING,
        'Deployment status checks pending. Commit cannot be deployed.',
      ));

    function checkDeployCommitState(
      checkStatusState: CheckStatusState | undefined,
      checkConclusionState: CheckConclusionState | undefined,
      expectedStatus: StatusWithTextStatus,
      expectedText: string,
    ) {
      const githubDataService = TestBed.inject(GithubDataService);
      spyOn(githubDataService, 'loadCommitState').and.returnValue(
        of(
          !checkStatusState
            ? []
            : [
                {
                  app: {
                    name: 'GitHub Actions',
                  },
                  branch: {
                    name: 'main',
                  },
                  workflowRun: {
                    workflow: {
                      name: 'CI',
                    },
                    url: 'https://github.com/organisation/repository-name/actions/runs/1',
                  },
                  status: checkStatusState,
                  conclusion: checkConclusionState,
                },
                {
                  app: {
                    name: 'GitHub Actions',
                  },
                  branch: {
                    name: 'main',
                  },
                  workflowRun: {
                    workflow: {
                      name: 'Merge Checks',
                    },
                    url: 'https://github.com/organisation/repository-name/actions/runs/2',
                  },
                  status: CheckStatusState.COMPLETED,
                  conclusion: CheckConclusionState.SUCCESS,
                },
              ],
        ),
      );

      let commitState!: CommitState | null;
      service
        .getDeployCommitState('testOwner', 'testRepo', commitToDeploy, 'main')
        .subscribe((result) => (commitState = result));

      const expectedCommitState: CommitState = {
        status: expectedStatus,
        text: expectedText,
        url: 'https://github.com/organisation/repository-name/commit/200000',
        checkSuites: !checkStatusState
          ? []
          : [
              {
                status: expectedStatus,
                text: 'CI',
                url: 'https://github.com/organisation/repository-name/actions/runs/1',
              },
              {
                status: StatusWithTextStatus.SUCCESS,
                text: 'Merge Checks',
                url: 'https://github.com/organisation/repository-name/actions/runs/2',
              },
            ],
      };

      expect(commitState).toEqual(expectedCommitState);
    }
  });

  function getCommitMock(
    oid: string,
    committedDate: Date,
    message: string,
    parents: string[],
  ): Commit {
    return {
      parents,
      commitUrl: `https://github.com/organisation/repository-name/commit/${oid}`,
      committedDate,
      id: `C_${oid}`,
      oid,
      abbreviatedOid: oid,
      message,
      author: {
        name: 'testuser',
        login: 'testuser',
      },
      committer: {
        name: 'GitHub',
        email: 'noreply@github.com',
      },
      deployments: [],
      isMergeCommit: false,
    };
  }
});
