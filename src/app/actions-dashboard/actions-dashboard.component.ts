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
import { firstValueFrom, of } from 'rxjs';
import { RepositoryFilterService } from '../repository-filter.service';

import { ActionsDashboardItemComponent } from '../actions-dashboard-item/actions-dashboard-item.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PollingProgessComponent } from '../polling-progress/polling-progess.component';
import { Repository } from '../core/repository';
import { ActionsDashboardConfig } from '../core/actions-dashboard-config';
import { AndActionDataService } from '../core/and-action-data.service';
import { AddRepositoryComponent } from '../add-repository/add-repository.component';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  imports: [
    ActionsDashboardItemComponent,
    MatProgressSpinnerModule,
    PollingProgessComponent,
    AddRepositoryComponent,
    CdkDropList,
    CdkDrag,
  ],
  selector: 'ana-actions-dashboard',
  templateUrl: './actions-dashboard.component.html',
  styleUrl: './actions-dashboard.component.scss',
})
export class ActionsDashboardComponent {
  protected readonly repositories: ResourceRef<Repository[] | undefined>;
  protected readonly repositoriesNameWithOwner = computed(
    () =>
      this.repositories
        .value()
        ?.map((repository) => repository.nameWithOwner) ?? [],
  );
  protected readonly filteredRepositories: Signal<Repository[]>;

  protected readonly updateIntervalInSeconds = 60;

  private readonly andActionDataService = inject(AndActionDataService);

  constructor() {
    const githubDataService = inject(GithubDataService);
    const filterValue = inject(RepositoryFilterService).splitValue;

    this.repositories = resource({
      loader: () =>
        firstValueFrom(
          githubDataService
            .loadOrganizationsWithSelectedRepositories()
            .pipe(
              mergeMap((repositories) =>
                repositories.length > 0
                  ? githubDataService.loadWorkflowRuns(repositories)
                  : of([]),
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

  protected deleteRepository(repository: Repository) {
    const repositories = this.repositories.value();

    if (repositories) {
      const newRepositories = repositories.filter(
        (curr) => curr.nameWithOwner !== repository.nameWithOwner,
      );

      this.repositories.set(newRepositories);
      this.andActionDataService.saveActionsDashboardConfig(
        new ActionsDashboardConfig(this.repositoriesNameWithOwner()),
      );
    }
  }

  protected drop(event: CdkDragDrop<string[]>) {
    // Changing order is only possible when repositories are not filtered.
    const repositories = [...(this.repositories.value() ?? [])];
    if (this.filteredRepositories().length !== repositories.length) {
      return;
    }
    moveItemInArray(repositories, event.previousIndex, event.currentIndex);
    this.repositories.set(repositories);
    this.andActionDataService.saveActionsDashboardConfig(
      new ActionsDashboardConfig(this.repositoriesNameWithOwner()),
    );
  }
}
