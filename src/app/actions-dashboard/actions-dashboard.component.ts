import { Component, OnInit } from '@angular/core';
import { AppRouting } from '../app-routing';
import { AndActionDataService } from '../core/and-action-data.service';
import { GithubDataService } from '../core/github-data.service';
import { flatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Organization } from '../core/organization';
import { GithubViewer } from '../core/github-viewer';

@Component({
  selector: 'ana-actions-dashboard',
  templateUrl: './actions-dashboard.component.html',
  styleUrls: ['./actions-dashboard.component.scss']
})
export class ActionsDashboardComponent implements OnInit {
  appRouting = AppRouting;
  viewerAndOrganizations$: Observable<(GithubViewer | Organization)[]>;

  constructor(
    private githubDataService: GithubDataService,
    private andActionDataService: AndActionDataService
  ) {}

  ngOnInit(): void {
    const repositoryNameWithOwnerList = this.andActionDataService
      .actionsDashboardConfig.selectedRepositoriesNameWithOwnerForDashboard;

    this.viewerAndOrganizations$ = this.githubDataService
      .loadViewerAndOrganizations()
      .pipe(
        flatMap(organizations => {
          organizations = organizations
            .map(organization => ({
              ...organization,
              repositories: organization.repositories.filter(
                repository =>
                  repositoryNameWithOwnerList.indexOf(
                    repository.nameWithOwner
                  ) !== -1
              )
            }))
            .filter(organization => organization.repositories.length > 0);
          return this.githubDataService.pollWorkflowRuns(organizations);
        })
      );
  }
}
