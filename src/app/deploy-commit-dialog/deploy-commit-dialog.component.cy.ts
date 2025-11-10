import {
  DeployCommitDialogComponent,
  DialogData,
} from './deploy-commit-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Commit,
  DeploymentState,
  RepositoryWithCommits,
} from '../commits-dashboard/commits-dashboard-models';
import { getCommitMock } from '../../test-utils/data-mocks';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DeployCommitDialogService } from './deploy-commit-dialog.service';
import { DeploymentType } from './deployment-type';
import { Observable, of, throwError } from 'rxjs';
import { DeployCommitEnvironment } from './deploy-commit-environment';
import { NoEnvironmentConfigFoundError } from './deploy-commit-errors';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { DEFAULT_DATE_FORMAT } from '../constants';
import { CommitState } from '../core/commit-state';
import { StatusWithTextStatus } from '../core/status-with-text';
import { provideZonelessChangeDetection } from '@angular/core';

describe('DeployCommitDialogComponent', () => {
  const commits: Commit[] = [getCommitMock()];
  const repository: RepositoryWithCommits = {
    id: '1234',
    name: 'and-action',
    owner: {
      login: 'and-action',
      url: 'https://github.com/and-action',
    },
    nameWithOwner: 'and-action/and-action',
    defaultBranchRef: { name: 'main' },
    isArchived: false,
    url: 'https://github.com/and-action/and-action',
    commits,
  };

  const dialogData: DialogData = {
    repository,
    commitToDeploy: commits[0],
    commits,
  };

  const commitStateSuccess: CommitState = {
    status: StatusWithTextStatus.SUCCESS,
    text: 'GitHub status checks are successful. Commit can be deployed.',
    url: 'https://github.com/organisation/repository-name/commit/200000',
    checkSuites: [
      {
        status: StatusWithTextStatus.SUCCESS,
        text: 'CI',
        url: 'https://github.com/organisation/repository-name/actions/runs/1',
      },
      {
        status: StatusWithTextStatus.SUCCESS,
        text: 'Merge checks',
        url: 'https://github.com/organisation/repository-name/actions/runs/2',
      },
    ],
  };

  const commitStateFailed: CommitState = {
    status: StatusWithTextStatus.FAILED,
    text: 'GitHub status checks failed. Commit cannot be deployed.',
    url: 'https://github.com/organisation/repository-name/commit/200000',
    checkSuites: [
      {
        status: StatusWithTextStatus.FAILED,
        text: 'CI',
        url: 'https://github.com/organisation/repository-name/actions/runs/1',
      },
      {
        status: StatusWithTextStatus.SUCCESS,
        text: 'Merge checks',
        url: 'https://github.com/organisation/repository-name/actions/runs/2',
      },
    ],
  };

  function mountComponent(
    getEnvironments: () => Observable<DeployCommitEnvironment[]>,
    commitState: CommitState,
    isArchived: boolean,
  ) {
    cy.mount(DeployCommitDialogComponent, {
      imports: [
        ApolloTestingModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: DeployCommitDialogService,
          useValue: {
            getEnvironments,
            deployToEnvironment: () => of({}),
            getDeployCommitState: () => of(commitState),
          },
        },
        {
          provide: MatDialogRef,
          useValue: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            close() {},
          },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            ...dialogData,
            repository: { ...dialogData.repository, isArchived },
          },
        },
        provideZonelessChangeDetection(),
      ],
      componentProperties: {},
    });
  }

  beforeEach(() => cy.viewport(600, 500));

  describe('without andaction.yml config', () => {
    beforeEach(() =>
      mountComponent(
        () => throwError(() => new NoEnvironmentConfigFoundError()),
        commitStateSuccess,
        false,
      ),
    );

    it('should have correct heading ', () =>
      cy.contains(
        'h2',
        `Deploy to ${repository.owner.login} / ${repository.name}`,
      ));

    it('should show placeholder text', () => {
      cy.contains('p', 'No environment configuration found.');
      cy.contains('a', 'Commits & Deployments');
      cy.contains('a', 'Configuration');
      cy.get('button.environment__action').should('not.exist');
    });
  });

  describe('with config', () => {
    const deploymentDate = new Date('2022-12-23 21:50:13 GMT+0100');
    const getEnvironments = (): Observable<DeployCommitEnvironment[]> =>
      of([
        {
          name: 'dev',
          canBeDeployed: { value: true },
          deploymentType: DeploymentType.FORWARD,
          deploymentDate,
          deploymentState: DeploymentState.ACTIVE,
        },
        {
          name: 'test',
          canBeDeployed: { value: true },
          deploymentType: DeploymentType.FORWARD,
        },
        {
          name: 'live',
          canBeDeployed: {
            value: false,
            reason:
              'Deploy is not possible before <strong>test</strong> is deployed.',
          },
          deploymentType: DeploymentType.FORWARD,
        },
      ]);

    it('should show commit state and buttons correctly for successful commit state', () => {
      mountComponent(getEnvironments, commitStateSuccess, false);
      checkCommitStates(commitStateSuccess);
      checkEnvironments(true);
    });

    it('should show commit state and buttons correctly for failed commit state', () => {
      mountComponent(getEnvironments, commitStateFailed, false);
      checkCommitStates(commitStateFailed);
      checkEnvironments(false);
    });

    it('should show placeholder texts for archived repository', () => {
      mountComponent(getEnvironments, commitStateSuccess, true);
      cy.contains('h2', `Deploy to ${repository.name}`);
      cy.contains('p', 'The repository is archived.');
      cy.contains('a', 'Commits & Deployments');
      cy.get('button.environment__action').should('not.exist');
    });

    function checkCommitStates(commitState: CommitState) {
      const checkCommitState = (
        $element: any,
        expectedStatus: StatusWithTextStatus,
        expectedText: string,
      ) => {
        cy.wrap($element).find(`.status__icon--${expectedStatus}`);
        cy.wrap($element).find('.status-text').should('contain', expectedText);
      };

      cy.get('ana-status-with-text').then(($elements) => {
        checkCommitState($elements[0], commitState.status, commitState.text);
        commitState.checkSuites.forEach((checkSuite, index) => {
          checkCommitState(
            $elements[index + 1],
            checkSuite.status,
            checkSuite.text,
          );
        });
      });
    }

    function checkEnvironments(isCommitStatusSuccess: boolean) {
      const datePipe = new DatePipe('en-us');

      checkEnvironment(
        'dev',
        !isCommitStatusSuccess,
        `Deploy triggered on ${datePipe.transform(
          deploymentDate,
          DEFAULT_DATE_FORMAT,
        )} at ${datePipe.transform(deploymentDate, 'H:mm:ss')}`,
        'Active',
      );
      checkEnvironment('test', !isCommitStatusSuccess);
      checkEnvironment(
        'live',
        true,
        'Deploy is not possible before test is deployed.',
      );

      function checkEnvironment(
        environmentName: string,
        expectedDisabled: boolean,
        expectedText?: string,
        expectedState?: string,
      ) {
        cy.contains('.environment__tag', environmentName)
          .next('button.environment__action')
          .should('contain', 'Deploy')
          .and(expectedDisabled ? 'be.disabled' : 'not.be.disabled')
          .next('.environment__text')
          .should('contain', expectedText ?? '')
          .next('.environment__state')
          .should('contain', expectedState ?? '');

        if (!expectedDisabled) {
          cy.contains('.environment__tag', environmentName)
            .next('button.environment__action')
            .click();

          cy.contains('ana-snack-bar', 'Deployment triggered successfully.');
          cy.contains('ana-snack-bar button', 'Close').click();
        }
      }
    }
  });
});
