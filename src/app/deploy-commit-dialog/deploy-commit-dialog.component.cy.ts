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

describe('DeployCommitDialogComponent', () => {
  const commits: Commit[] = [getCommitMock()];
  const repository: RepositoryWithCommits = {
    id: '1234',
    name: 'and-action',
    owner: 'and-action',
    defaultBranchRef: { name: 'main' },
    url: 'https://github.com/and-action/and-action',
    commits,
  };

  const dialogData: DialogData = {
    repository,
    commitToDeploy: commits[0],
    commits,
  };

  function mountComponent(
    getEnvironments: () => Observable<DeployCommitEnvironment[]>
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
          useValue: dialogData,
        },
      ],
      componentProperties: {},
    });
  }

  beforeEach(() => cy.viewport(600, 500));

  describe('without andaction.yml config', () => {
    beforeEach(() =>
      mountComponent(() =>
        throwError(() => new NoEnvironmentConfigFoundError())
      )
    );

    it('should have correct heading ', () =>
      cy.contains('h2', `Deploy to ${repository.name}`));

    it('should show placeholder text', () =>
      cy.contains('p', 'No environment configuration found.'));
  });

  describe('with config', () => {
    const deploymentDate = new Date('2022-12-23 21:50:13 GMT+0100');

    beforeEach(() => {
      const getEnvironments = (): Observable<DeployCommitEnvironment[]> =>
        of([
          {
            name: 'dev',
            canBeDeployed: { value: true },
            deploymentType: DeploymentType.REDEPLOY,
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
      mountComponent(getEnvironments);
    });

    it('should show buttons correctly', () => {
      const datePipe = new DatePipe('en-us');

      checkEnvironment(
        'dev',
        'Redeploy',
        false,
        `Deploy triggered on ${datePipe.transform(
          deploymentDate,
          DEFAULT_DATE_FORMAT
        )} at ${datePipe.transform(deploymentDate, 'H:mm:ss')}`,
        'Active'
      );
      checkEnvironment('test', 'Deploy', false);
      checkEnvironment(
        'live',
        'Deploy',
        true,
        'Deploy is not possible before test is deployed.'
      );

      function checkEnvironment(
        environmentName: string,
        expectedButtonLabel: string,
        expectedDisabled: boolean,
        expectedText?: string,
        expectedState?: string
      ) {
        cy.contains('.environment__tag', environmentName)
          .next('button.environment__action')
          .should('contain', expectedButtonLabel)
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
    });
  });
});
