import {
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { combineLatest, Observable, tap } from 'rxjs';
import { RepositoryWithCommits } from './commits-dashboard-models';
import { delay, map, mergeMap } from 'rxjs/operators';
import { RepositoryFilterService } from '../repository-filter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { CommitsGraphComponent } from '../commits-graph/commits-graph.component';
import { CommitsListComponent } from '../commits-list/commits-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { LoadingStatus } from '../loading-status';
import { PollingProgessComponent } from '../polling-progress/polling-progess.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  imports: [
    CommitsGraphComponent,
    CommitsListComponent,
    MatDialogModule,
    MatProgressSpinnerModule,
    PollingProgessComponent,
  ],
  selector: 'ana-commits-dashboard',
  templateUrl: './commits-dashboard.component.html',
  styleUrls: ['./commits-dashboard.component.scss'],
})
export class CommitsDashboardComponent {
  protected repositories$?: Observable<RepositoryWithCommits[]>;

  protected repositories = signal<RepositoryWithCommits[]>([]);
  protected filteredRepositories: Signal<RepositoryWithCommits[]>;

  protected loadingStatus = LoadingStatus.LOADING;
  protected loadingStatusEnum = LoadingStatus;
  protected updateIntervalInSeconds = 60;

  private queryParams = toSignal(inject(ActivatedRoute).queryParams);
  private githubDataService = inject(GithubDataService);

  constructor() {
    const router = inject(Router);
    const document = inject(DOCUMENT);
    const filterValue = inject(RepositoryFilterService).value;

    this.repositories$ = this.githubDataService
      .loadOrganizationsWithSelectedRepositories()
      .pipe(
        map((organizations) =>
          organizations.flatMap((organization) => organization.repositories),
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
        tap({
          next: (repositories) => {
            this.repositories.set(repositories);
            this.loadingStatus = LoadingStatus.FINISHED;
          },
          error: () => (this.loadingStatus = LoadingStatus.FAILED),
        }),
      );

    this.filteredRepositories = computed<RepositoryWithCommits[]>(() =>
      this.repositories().filter(
        (repository) =>
          !filterValue() ||
          repository.name
            .toLowerCase()
            .includes(filterValue()?.toLowerCase() ?? ''),
      ),
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
      .loadRepositoryCommits(repository.owner, repository.name)
      .pipe(delay(3000))
      .subscribe((repositoryWithCommits) => {
        const indexToUpdate = this.repositories().findIndex(
          (repo) =>
            repo.owner === repositoryWithCommits.owner &&
            repo.name === repositoryWithCommits.name,
        );

        if (
          indexToUpdate !== undefined &&
          indexToUpdate !== -1 &&
          this.repositories()[indexToUpdate]
        ) {
          this.repositories.update((repositories) =>
            repositories.map((value, index) =>
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
