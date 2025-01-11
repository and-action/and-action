import {
  Component,
  computed,
  inject,
  resource,
  ResourceRef,
  Signal,
} from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { mergeMap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { Organization } from '../core/organization';
import { GithubViewer } from '../core/github-viewer';
import { RepositoryFilterService } from '../repository-filter.service';

import { ActionsDashboardItemComponent } from '../actions-dashboard-item/actions-dashboard-item.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PollingProgessComponent } from '../polling-progress/polling-progess.component';

@Component({
  imports: [
    ActionsDashboardItemComponent,
    MatProgressSpinnerModule,
    PollingProgessComponent,
  ],
  selector: 'ana-actions-dashboard',
  templateUrl: './actions-dashboard.component.html',
  styleUrl: './actions-dashboard.component.scss',
})
export class ActionsDashboardComponent {
  protected viewerAndOrganizations: ResourceRef<
    (GithubViewer | Organization)[]
  >;
  protected filteredViewerAndOrganizations: Signal<
    (GithubViewer | Organization)[]
  >;

  protected updateIntervalInSeconds = 60;

  constructor() {
    const githubDataService = inject(GithubDataService);
    const filterValue = inject(RepositoryFilterService).splitValue;

    this.viewerAndOrganizations = resource({
      loader: () =>
        firstValueFrom(
          githubDataService
            .loadOrganizationsWithSelectedRepositories()
            .pipe(
              mergeMap((organizations) =>
                githubDataService.loadWorkflowRuns(organizations),
              ),
            ),
        ),
    });

    this.filteredViewerAndOrganizations = computed(
      () =>
        this.viewerAndOrganizations
          .value()
          ?.map((viewerAndOrganization) => ({
            ...viewerAndOrganization,
            repositories: viewerAndOrganization.repositories.filter(
              (repository) =>
                filterValue().length === 0 ||
                filterValue().some((value) =>
                  repository.name
                    .toLowerCase()
                    .includes(value.toLowerCase().trim()),
                ),
            ),
          }))
          .filter(
            (viewerAndOrganization) =>
              viewerAndOrganization.repositories.length > 0,
          ) ?? [],
    );
  }
}
