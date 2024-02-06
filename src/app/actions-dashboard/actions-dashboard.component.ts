import { Component, computed, inject, Signal, signal } from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { mergeMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Organization } from '../core/organization';
import { GithubViewer } from '../core/github-viewer';
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
export class ActionsDashboardComponent {
  protected viewerAndOrganizations$?: Observable<
    (GithubViewer | Organization)[]
  >;
  protected filteredViewerAndOrganizations: Signal<
    (GithubViewer | Organization)[]
  >;

  protected loadingStatus = LoadingStatus.LOADING;
  protected loadingStatusEnum = LoadingStatus;
  protected updateIntervalInSeconds = 60;

  constructor() {
    const githubDataService = inject(GithubDataService);
    const viewerAndOrganizations = signal<(GithubViewer | Organization)[]>([]);
    const filterValue = inject(RepositoryFilterService).value;

    this.viewerAndOrganizations$ = githubDataService
      .loadOrganizationsWithSelectedRepositories()
      .pipe(
        mergeMap((organizations) =>
          githubDataService.loadWorkflowRuns(organizations),
        ),

        tap({
          next: (viewerAndOrgs) => {
            viewerAndOrganizations.set(viewerAndOrgs);
            this.loadingStatus = LoadingStatus.FINISHED;
          },
          error: () => (this.loadingStatus = LoadingStatus.FAILED),
        }),
      );

    this.filteredViewerAndOrganizations = computed(() =>
      viewerAndOrganizations()
        .map((viewerAndOrganization) => ({
          ...viewerAndOrganization,
          repositories: viewerAndOrganization.repositories.filter(
            (repository) =>
              !filterValue() ||
              repository.name
                .toLowerCase()
                .includes(filterValue()?.toLowerCase() ?? ''),
          ),
        }))
        .filter(
          (viewerAndOrganization) =>
            viewerAndOrganization.repositories.length > 0,
        ),
    );
  }
}
