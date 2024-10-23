import {
  Component,
  computed,
  inject,
  resource,
  ResourceRef,
  Signal,
} from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { map, mergeMap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { RepositoryFilterService } from '../repository-filter.service';

import { ActionsDashboardItemComponent } from '../actions-dashboard-item/actions-dashboard-item.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PollingProgessComponent } from '../polling-progress/polling-progess.component';
import { Repository } from '../core/repository';
import { ActionsDashboardConfig } from '../core/actions-dashboard-config';
import { AndActionDataService } from '../core/and-action-data.service';
import { AddRepositoryComponent } from '../add-repository/add-repository.component';

@Component({
  imports: [
    ActionsDashboardItemComponent,
    MatProgressSpinnerModule,
    PollingProgessComponent,
    AddRepositoryComponent,
  ],
  selector: 'ana-actions-dashboard',
  templateUrl: './actions-dashboard.component.html',
  styleUrl: './actions-dashboard.component.scss',
})
export class ActionsDashboardComponent {
  protected repositories: ResourceRef<Repository[]>;
  protected repositoriesNameWithOwner = computed(
    () =>
      this.repositories
        .value()
        ?.map((repository) => repository.nameWithOwner) ?? [],
  );
  protected filteredRepositories: Signal<Repository[]>;

  protected updateIntervalInSeconds = 60;

  private andActionDataService = inject(AndActionDataService);

  constructor() {
    const githubDataService = inject(GithubDataService);
    const filterValue = inject(RepositoryFilterService).splitValue;

    this.repositories = resource({
      loader: () =>
        firstValueFrom(
          githubDataService.loadOrganizationsWithSelectedRepositories().pipe(
            map((organizations) =>
              organizations.flatMap(
                (organization) => organization.repositories,
              ),
            ),
            mergeMap((repositories) =>
              githubDataService.loadWorkflowRuns(repositories),
            ),
          ),
        ),
    });

    this.filteredRepositories = computed(
      () =>
        this.repositories
          .value()
          ?.filter(
            (repository) =>
              filterValue().length === 0 ||
              filterValue().some((value) =>
                repository.name
                  .toLowerCase()
                  .includes(value.toLowerCase().trim()),
              ),
          ) ?? [],
    );
  }

  protected addRepositories(repositories: string[]) {
    this.andActionDataService.saveActionsDashboardConfig(
      new ActionsDashboardConfig([
        ...this.repositoriesNameWithOwner(),
        ...repositories,
      ]),
    );
    this.repositories.set(undefined); // Make loading spinner appear.
    this.repositories.reload();
  }
}
