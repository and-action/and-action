import {
  Component,
  computed,
  effect,
  inject,
  resource,
  ResourceRef,
  Signal,
} from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { combineLatest, firstValueFrom, of } from 'rxjs';
import { RepositoryWithCommits } from './commits-dashboard-models';
import { delay, mergeMap } from 'rxjs/operators';
import { RepositoryFilterService } from '../repository-filter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { CommitsGraphComponent } from '../commits-graph/commits-graph.component';
import { CommitsListComponent } from '../commits-list/commits-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { PollingProgessComponent } from '../polling-progress/polling-progess.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { AndActionDataService } from '../core/and-action-data.service';
import { AddRepositoryComponent } from '../add-repository/add-repository.component';
import { ActionsDashboardConfig } from '../core/actions-dashboard-config';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  imports: [
    CommitsGraphComponent,
    CommitsListComponent,
    MatDialogModule,
    MatProgressSpinnerModule,
    PollingProgessComponent,
    AddRepositoryComponent,
    MatIconButton,
    MatIcon,
  ],
  selector: 'ana-commits-dashboard',
  templateUrl: './commits-dashboard.component.html',
  styleUrl: './commits-dashboard.component.scss',
})
export class CommitsDashboardComponent {
  protected readonly repositories: ResourceRef<RepositoryWithCommits[]>;
  protected readonly repositoriesNameWithOwner = computed(
    () =>
      this.repositories
        .value()
        ?.map((repository) => repository.nameWithOwner) ?? [],
  );
  protected readonly filteredRepositories: Signal<RepositoryWithCommits[]>;

  protected readonly updateIntervalInSeconds = 60;

  private readonly queryParams = toSignal(inject(ActivatedRoute).queryParams);
  private readonly githubDataService = inject(GithubDataService);
  private readonly andActionDataService = inject(AndActionDataService);

  constructor() {
    const router = inject(Router);
    const document = inject(DOCUMENT);
    const filterValue = inject(RepositoryFilterService).splitValue;
    this.repositories = resource({
      loader: () =>
        firstValueFrom(
          this.githubDataService
            .loadOrganizationsWithSelectedRepositories()
            .pipe(
              mergeMap((repositories) =>
                repositories.length > 0
                  ? combineLatest(
                      repositories.map((repository) =>
                        this.githubDataService.loadRepositoryCommits(
                          repository.owner.login,
                          repository.name,
                          this.andActionDataService.commitsDashboardConfig
                            .commitsHistoryCount,
                        ),
                      ),
                    )
                  : of([]),
              ),
            ),
        ),
    });

    this.filteredRepositories = computed<RepositoryWithCommits[]>(
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

    effect(() => {
      if (
        this.queryParams()?.repository &&
        this.filteredRepositories().length > 0
      ) {
        setTimeout(() => {
          document
            .getElementById(this.queryParams()?.repository)
            ?.scrollIntoView({
              block: 'start',
              inline: 'start',
              behavior: 'smooth',
            });
          router.navigate([], { replaceUrl: true });
        });
      }
    });
  }

  protected reloadCommitsForRepository(repository: RepositoryWithCommits) {
    this.githubDataService
      .loadRepositoryCommits(
        repository.owner.login,
        repository.name,
        this.andActionDataService.commitsDashboardConfig.commitsHistoryCount,
      )
      .pipe(delay(3000))
      .subscribe((repositoryWithCommits) => {
        const indexToUpdate = this.repositories
          .value()
          ?.findIndex(
            (repo) =>
              repo.owner === repositoryWithCommits.owner &&
              repo.name === repositoryWithCommits.name,
          );

        if (
          indexToUpdate !== undefined &&
          indexToUpdate !== -1 &&
          this.repositories.value()?.[indexToUpdate]
        ) {
          this.repositories.update((repositories) =>
            repositories?.map((value, index) =>
              index === indexToUpdate ? repositoryWithCommits : value,
            ),
          );
        }
      });
  }

  protected repositoriesTrackBy(_: number, item: RepositoryWithCommits) {
    return item.id;
  }

  protected deleteRepository(repository: RepositoryWithCommits) {
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
