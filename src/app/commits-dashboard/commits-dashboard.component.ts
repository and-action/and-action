import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { combineLatest, Observable, Subscription, tap } from 'rxjs';
import { RepositoryWithCommits } from './commits-dashboard-models';
import { map, mergeMap } from 'rxjs/operators';
import { RepositoryFilterService } from '../repository-filter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'ana-commits-dashboard',
  templateUrl: './commits-dashboard.component.html',
  styleUrls: ['./commits-dashboard.component.scss'],
})
export class CommitsDashboardComponent implements OnInit, OnDestroy {
  repositories$?: Observable<RepositoryWithCommits[]>;

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
        )
      );

    this.scrollSubscription = combineLatest([
      this.repositories$,
      this.route.queryParams,
    ])
      .pipe(
        tap(([_, queryParams]) => {
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
