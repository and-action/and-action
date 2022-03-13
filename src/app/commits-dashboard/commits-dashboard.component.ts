import { Component, OnInit } from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { combineLatest, Observable } from 'rxjs';
import { RepositoryWithCommits } from './commits-dashboard-models';
import { map, mergeMap } from 'rxjs/operators';
import { RepositoryFilterService } from '../repository-filter.service';

@Component({
  selector: 'ana-commits-dashboard',
  templateUrl: './commits-dashboard.component.html',
  styleUrls: ['./commits-dashboard.component.scss'],
})
export class CommitsDashboardComponent implements OnInit {
  repositories$?: Observable<RepositoryWithCommits[]>;

  constructor(
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
                  !filterValue || repository.name.includes(filterValue)
              )
            )
          )
        )
      );
  }
}
