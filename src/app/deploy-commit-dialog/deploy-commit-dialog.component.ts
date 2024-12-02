import { Component, inject, OnInit, Signal } from '@angular/core';
import {
  Commit,
  DeploymentState,
  deploymentStateOutputTextMapping,
  RepositoryWithCommits,
} from '../commits-dashboard/commits-dashboard-models';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { EMPTY, Observable, of, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getDeploymentEnvironmentColors } from '../status-tag/status-tag-utils';
import { StatusTagColor } from '../status-tag/status-tag-color';
import { SnackBarService } from '../snack-bar/snack-bar.service';
import { DeployCommitDialogService } from './deploy-commit-dialog.service';
import { DeployCommitEnvironment } from './deploy-commit-environment';
import {
  CommitDeploymentsNotUpToDateError,
  CommitNotFoundError,
  CommitStatusNotSuccessfulError,
  NoEnvironmentConfigFoundError,
} from './deploy-commit-errors';
import { DeploymentType } from './deployment-type';
import { DEFAULT_DATE_FORMAT } from '../constants';
import { CommitInfoComponent } from '../commit-info/commit-info.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommitState } from '../core/commit-state';
import { StatusWithTextComponent } from '../status-with-text/status-with-text.component';
import { StatusWithTextStatus } from '../core/status-with-text';

export interface DialogData {
  repository: RepositoryWithCommits;
  commitToDeploy: Commit;
  commits: Commit[];
}

@Component({
  imports: [
    CommonModule,
    CommitInfoComponent,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    StatusWithTextComponent,
  ],
  selector: 'ana-deploy-commit-dialog',
  templateUrl: './deploy-commit-dialog.component.html',
  styleUrl: './deploy-commit-dialog.component.scss',
})
export class DeployCommitDialogComponent implements OnInit {
  protected environments$?: Observable<DeployCommitEnvironment[]>;
  protected isLoading = false;
  protected environmentColorMapping: {
    [environment: string]: StatusTagColor;
  } = {};
  protected deploymentType = DeploymentType;
  protected dateFormat = DEFAULT_DATE_FORMAT;
  protected dialogData = inject<DialogData>(MAT_DIALOG_DATA);

  private deployCommitDialogService = inject(DeployCommitDialogService);
  private snackBarService = inject(SnackBarService);
  private dialogRef = inject(MatDialogRef<DeployCommitDialogComponent>);

  protected commitState: Signal<CommitState | null> = toSignal(
    this.deployCommitDialogService.getDeployCommitState(
      this.dialogData.repository.owner.login,
      this.dialogData.repository.name,
      this.dialogData.commitToDeploy,
      this.dialogData.repository.defaultBranchRef.name,
    ),
    { initialValue: null },
  );

  ngOnInit() {
    this.environments$ = this.deployCommitDialogService
      .getEnvironments(
        this.dialogData.repository.owner.login,
        this.dialogData.repository.name,
        this.dialogData.commitToDeploy,
        this.dialogData.commits,
      )
      .pipe(
        tap(
          (environments) =>
            (this.environmentColorMapping = getDeploymentEnvironmentColors(
              environments.map((env) => env.name),
            )),
        ),
        catchError((error: unknown) =>
          error instanceof NoEnvironmentConfigFoundError
            ? of([])
            : throwError(() => error),
        ),
      );
  }

  getDeployButtonLabel(deploymentType: DeploymentType) {
    switch (deploymentType) {
      case DeploymentType.FORWARD:
        return 'Deploy';
      case DeploymentType.ROLLBACK:
        return 'Rollback';
    }
  }

  getDeploymentStateOutputText(deploymentState?: DeploymentState) {
    return deploymentState
      ? deploymentStateOutputTextMapping[deploymentState]
      : '';
  }

  getStateTagCssClass(deploymentState?: DeploymentState) {
    return deploymentState
      ? `u-state-tag--${deploymentState.toLowerCase()}`
      : '';
  }

  canBeDeployed(environment: DeployCommitEnvironment) {
    return (
      environment.canBeDeployed.value &&
      this.commitState()?.status === StatusWithTextStatus.SUCCESS &&
      !this.isLoading
    );
  }

  deployToEnvironment(
    environment: DeployCommitEnvironment,
    environments: DeployCommitEnvironment[],
  ) {
    this.isLoading = true;
    const {
      owner,
      name,
      defaultBranchRef: { name: defaultBranchName },
    } = this.dialogData.repository;
    this.deployCommitDialogService
      .deployToEnvironment(
        owner.login,
        name,
        defaultBranchName,
        this.dialogData.commitToDeploy,
        environment.name,
        environments,
      )
      .pipe(
        catchError((error: unknown) => {
          this.isLoading = false;
          const errorMessage =
            error instanceof CommitNotFoundError
              ? 'Cannot trigger deployment, because commit to deploy could not be found.'
              : error instanceof CommitStatusNotSuccessfulError
                ? 'Cannot trigger deployment, because GitHub status checks for commit are not successful.'
                : error instanceof CommitDeploymentsNotUpToDateError
                  ? 'Cannot trigger deployment, because something changed in the meantime. Please reopen the deploy dialog and try again.'
                  : 'Error triggering deployment. Please try again.';

          this.snackBarService.error(errorMessage);

          return error instanceof CommitStatusNotSuccessfulError ||
            error instanceof CommitDeploymentsNotUpToDateError
            ? EMPTY
            : throwError(() => error);
        }),
      )
      .subscribe(() => {
        this.isLoading = false;
        this.snackBarService.info('Deployment triggered successfully.');
        this.dialogRef.close(true);
      });
  }
}
