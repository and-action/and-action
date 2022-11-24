import { Component, OnInit } from '@angular/core';
import { GithubDataService } from '../core/github-data.service';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Organization } from '../core/organization';
import { GithubViewer } from '../core/github-viewer';
import { StatusIconService } from '../status-icon.service';
import { RepositoryFilterService } from '../repository-filter.service';
import { CommonModule } from '@angular/common';
import { ActionsDashboardItemComponent } from '../actions-dashboard-item/actions-dashboard-item.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  imports: [
    ActionsDashboardItemComponent,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'ana-actions-dashboard',
  templateUrl: './actions-dashboard.component.html',
  styleUrls: ['./actions-dashboard.component.scss'],
})
export class ActionsDashboardComponent implements OnInit {
  viewerAndOrganizations$?: Observable<(GithubViewer | Organization)[]>;

  constructor(
    private githubDataService: GithubDataService,
    private statusIconService: StatusIconService,
    private repositoryFilterService: RepositoryFilterService
  ) {}

  ngOnInit(): void {
    this.viewerAndOrganizations$ = this.githubDataService
      .loadOrganizationsWithSelectedRepositories()
      .pipe(
        mergeMap((organizations) =>
          this.githubDataService
            .pollWorkflowRuns(organizations)
            .pipe(
              tap((viewerAndOrganizations) =>
                this.statusIconService.updateStatusIcon(viewerAndOrganizations)
              )
            )
        ),
        mergeMap((viewerAndOrganizations) =>
          this.repositoryFilterService.filterValue$.pipe(
            map((filterValue) =>
              viewerAndOrganizations
                .map((viewerAndOrganization) => ({
                  ...viewerAndOrganization,
                  repositories: viewerAndOrganization.repositories.filter(
                    (repository) =>
                      !filterValue ||
                      repository.name
                        .toLowerCase()
                        .includes(filterValue.toLowerCase())
                  ),
                }))
                .filter(
                  (viewerAndOrganization) =>
                    viewerAndOrganization.repositories.length > 0
                )
            )
          )
        )
      );
  }
}
