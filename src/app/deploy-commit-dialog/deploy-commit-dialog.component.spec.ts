import { ComponentFixture, TestBed } from '@angular/core/testing';

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
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAndActionApollo } from '../../provideApollo';
import { provideZonelessChangeDetection } from '@angular/core';

const getCommit = (): Commit => ({
  id: 'C_idOfCommit',
  oid: '7fcd3ab3bc3ca980957185cdbf813d127aaf5944',
  abbreviatedOid: '7fcd3ab',
  author: {
    name: 'MaxMustermann',
    login: 'mmm',
  },
  committedDate: new Date('2022-03-15T10:30:25Z'),
  committer: {
    name: 'GitHub',
    email: 'noreply@github.com',
  },
  commitUrl:
    'https://github.com/organisation/repository/commit/7fcd3ab3bc3ca980957185cdbf813d127aaf3c33',
  message: 'feat(scope): add new functionality\n\nCloses #123',
  isMergeCommit: true,
  parents: [
    'x32c00529a39452034893a33b641746044df5413',
    'fbabf6607c429fc3110ddfc81e506121ab7ecf12',
  ],
  deployments: [
    {
      id: 'DE_kwd0QZveWM4fVt24',
      creator: {
        login: 'mmm',
        name: 'Max Mustermann',
      },
      environment: 'dev',
      state: DeploymentState.ACTIVE,
      description: 'Deployed via And Action',
      timestamp: new Date('2022-03-15T10:51:31.000Z'),
      logUrl: null,
    },
  ],
});

const getCommits = () => [getCommit()];

const getRepository = (): RepositoryWithCommits => ({
  id: 'R_idOfRepository',
  name: 'and-action',
  nameWithOwner: 'and-action/and-action',
  owner: { login: 'and-action', url: 'https://github.com/and-action' },
  defaultBranchRef: { name: 'master' },
  url: 'https://github.com/and-action/and-action',
  isArchived: false,
  commits: [],
});

const getDialogData = (): DialogData => ({
  repository: getRepository(),
  commitToDeploy: getCommit(),
  commits: getCommits(),
});

describe('DeployCommitDialogComponent', () => {
  let component: DeployCommitDialogComponent;
  let fixture: ComponentFixture<DeployCommitDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: getDialogData(),
        },
        provideAndActionApollo(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeployCommitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
