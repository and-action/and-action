import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { combineLatest, Observable, Subscription, tap } from 'rxjs';
import { RepositoryWithCommits } from './commits-dashboard-models';
import { map, mergeMap } from 'rxjs/operators';
import { RepositoryFilterService } from '../repository-filter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { CommitsGraphComponent } from '../commits-graph/commits-graph.component';
import { CommitsListComponent } from '../commits-list/commits-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { LoadingStatus } from '../loading-status';
import { PollingProgessComponent } from '../polling-progress/polling-progess.component';

@Component({
  standalone: true,
  imports: [
    CommitsGraphComponent,
    CommitsListComponent,
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    PollingProgessComponent,
  ],
  selector: 'ana-commits-dashboard',
  templateUrl: './commits-dashboard.component.html',
  styleUrls: ['./commits-dashboard.component.scss'],
})
export class CommitsDashboardComponent implements OnInit, OnDestroy {
  protected repositories$?: Observable<RepositoryWithCommits[]>;
  protected repositories?: RepositoryWithCommits[];

  protected loadingStatus = LoadingStatus.LOADING;
  protected loadingStatusEnum = LoadingStatus;
  protected updateIntervalInSeconds = 60;

  private scrollSubscription?: Subscription;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private route: ActivatedRoute,
    private githubDataService: GithubDataService,
    private repositoryFilterService: RepositoryFilterService
  ) {}

  ngOnInit(): void {
    this.repositories$ = this.githubDataService
      .loadOrganizationsWithSelectedRepositories()
      .pipe(
        map((organizations) =>
          organizations.flatMap((organization) => organization.repositories)
        ),
        mergeMap((repositories) =>
          combineLatest(
            repositories.map((repository) =>
              this.githubDataService.loadRepositoryCommits(
                repository.owner.login,
                repository.name
              )
            )
          )
        ),
        mergeMap((repositories) =>
          this.repositoryFilterService.filterValue$.pipe(
            map((filterValue) =>
              repositories.filter(
                (repository) =>
                  !filterValue ||
                  repository.name
                    .toLowerCase()
                    .includes(filterValue.toLowerCase())
              )
            )
          )
        ),
        tap({
          next: (repositories) => {
            this.repositories = repositories;
            this.loadingStatus = LoadingStatus.FINISHED;
          },
          error: () => (this.loadingStatus = LoadingStatus.FAILED),
        })
      );

    this.scrollSubscription = combineLatest([
      this.repositories$,
      this.route.queryParams,
    ])
      .pipe(
        tap(([, queryParams]) => {
          if (queryParams.repository) {
            setTimeout(() => {
              this.document
                .getElementById(this.route.snapshot.queryParams.repository)
                ?.scrollIntoView({
                  block: 'start',
                  inline: 'start',
                  behavior: 'smooth',
                });
              this.router.navigate([], { replaceUrl: true });
            });
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.scrollSubscription?.unsubscribe();
  }
}
