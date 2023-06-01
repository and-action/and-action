import { Component, inject, OnInit } from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Organization } from '../core/organization';
import { GithubViewer } from '../core/github-viewer';
import { StatusIconService } from '../status-icon.service';
import { RepositoryFilterService } from '../repository-filter.service';
import { CommonModule } from '@angular/common';
import { ActionsDashboardItemComponent } from '../actions-dashboard-item/actions-dashboard-item.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingStatus } from '../loading-status';
import { PollingProgessComponent } from '../polling-progress/polling-progess.component';

@Component({
  standalone: true,
  imports: [
    ActionsDashboardItemComponent,
    CommonModule,
    MatProgressSpinnerModule,
    PollingProgessComponent,
  ],
  selector: 'ana-actions-dashboard',
  templateUrl: './actions-dashboard.component.html',
  styleUrls: ['./actions-dashboard.component.scss'],
})
export class ActionsDashboardComponent implements OnInit {
  protected viewerAndOrganizations$?: Observable<
    (GithubViewer | Organization)[]
  >;
  protected viewerAndOrganizations?: (GithubViewer | Organization)[];

  protected loadingStatus = LoadingStatus.LOADING;
  protected loadingStatusEnum = LoadingStatus;
  protected updateIntervalInSeconds = 60;

  private githubDataService = inject(GithubDataService);
  private statusIconService = inject(StatusIconService);
  private repositoryFilterService = inject(RepositoryFilterService);

  ngOnInit(): void {
    this.viewerAndOrganizations$ = this.githubDataService
      .loadOrganizationsWithSelectedRepositories()
      .pipe(
        mergeMap((organizations) =>
          this.githubDataService
            .loadWorkflowRuns(organizations)
            .pipe(
              tap((viewerAndOrganizations) =>
                this.statusIconService.updateStatusIcon(viewerAndOrganizations)
              )
            )
        ),
        mergeMap((viewerAndOrganizations) =>
          this.repositoryFilterService.filterValue$.pipe(
            map((filterValue) =>
              viewerAndOrganizations
                .map((viewerAndOrganization) => ({
                  ...viewerAndOrganization,
                  repositories: viewerAndOrganization.repositories.filter(
                    (repository) =>
                      !filterValue ||
                      repository.name
                        .toLowerCase()
                        .includes(filterValue.toLowerCase())
                  ),
                }))
                .filter(
                  (viewerAndOrganization) =>
                    viewerAndOrganization.repositories.length > 0
                )
            )
          )
        ),
        tap({
          next: (viewerAndOrganizations) => {
            this.viewerAndOrganizations = viewerAndOrganizations;
            this.loadingStatus = LoadingStatus.FINISHED;
          },
          error: () => (this.loadingStatus = LoadingStatus.FAILED),
        })
      );
  }
}
