import { Component, OnInit } from '@angular/core';
import { AndActionDataService } from '../core/and-action-data.service';
import { GithubDataService } from '../core/github-data.service';
import { flatMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Organization } from '../core/organization';
import { GithubViewer } from '../core/github-viewer';
import { StatusIconService } from '../status-icon.service';

@Component({
  selector: 'ana-actions-dashboard',
  templateUrl: './actions-dashboard.component.html',
  styleUrls: ['./actions-dashboard.component.scss']
})
export class ActionsDashboardComponent implements OnInit {
  viewerAndOrganizations$: Observable<(GithubViewer | Organization)[]>;

  constructor(
    private githubDataService: GithubDataService,
    private andActionDataService: AndActionDataService,
    private statusIconService: StatusIconService
  ) {}

  ngOnInit(): void {
    this.viewerAndOrganizations$ = this.githubDataService
      .loadOrganizationsWithSelectedRepositories()
      .pipe(
        flatMap(organizations =>
          this.githubDataService
            .pollWorkflowRuns(organizations)
            .pipe(
              tap(viewerAndOrganizations =>
                this.statusIconService.updateStatusIcon(viewerAndOrganizations)
              )
            )
        )
      );
  }
}
