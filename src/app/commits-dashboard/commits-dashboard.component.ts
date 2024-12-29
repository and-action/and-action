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
import { combineLatest, firstValueFrom } from 'rxjs';
import { RepositoryWithCommits } from './commits-dashboard-models';
import { delay, map, mergeMap } from 'rxjs/operators';
import { RepositoryFilterService } from '../repository-filter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { CommitsGraphComponent } from '../commits-graph/commits-graph.component';
import { CommitsListComponent } from '../commits-list/commits-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { PollingProgessComponent } from '../polling-progress/polling-progess.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [
    CommitsGraphComponent,
    CommitsListComponent,
    MatDialogModule,
    MatProgressSpinnerModule,
    PollingProgessComponent,
  ],
  selector: 'ana-commits-dashboard',
  templateUrl: './commits-dashboard.component.html',
  styleUrl: './commits-dashboard.component.scss',
})
export class CommitsDashboardComponent {
  protected repositories: ResourceRef<RepositoryWithCommits[]>;
  protected filteredRepositories: Signal<RepositoryWithCommits[]>;

  protected updateIntervalInSeconds = 60;

  private queryParams = toSignal(inject(ActivatedRoute).queryParams);
  private githubDataService = inject(GithubDataService);

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
              map((organizations) =>
                organizations.flatMap(
                  (organization) => organization.repositories,
                ),
              ),
              mergeMap((repositories) =>
                combineLatest(
                  repositories.map((repository) =>
                    this.githubDataService.loadRepositoryCommits(
                      repository.owner.login,
                      repository.name,
                    ),
                  ),
                ),
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
      .loadRepositoryCommits(repository.owner.login, repository.name)
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
}
