import { Component, OnInit } from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { combineLatest, Observable } from 'rxjs';
import { RepositoryWithCommits } from './commits-dashboard-models';
import { map, mergeMap } from 'rxjs/operators';
import { Repository } from '../core/repository';
import { RepositoryFilterService } from '../repository-filter.service';

// const COLORS = ['#00C853', '#FFD600', '#0091EA', '#AB435C', '#484853'];

const LIGHT_COLORS = [
  'rgba(0, 200, 83, 0.2)',
  'rgba(255, 214, 0, 0.2)',
  'rgba(0, 145, 234, 0.2)',
  'rgba(171, 67, 92, 0.2)',
  'rgba(72, 72, 83, 0.2)',
];

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
