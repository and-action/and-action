import { Component, OnInit } from '@angular/core';
import { AppRouting } from '../app-routing';
import { GithubDataService } from '../core/github-data.service';
import { from } from 'rxjs';
import { GithubViewer } from '../core/github-viewer';
import { Organization } from '../core/organization';
import { ActionsDashboardConfig } from '../core/actions-dashboard-config';
import { AndActionDataService } from '../core/and-action-data.service';
import { Router } from '@angular/router';
import { flatMap, reduce } from 'rxjs/operators';

@Component({
  selector: 'app-actions-dashboard-config',
  templateUrl: './actions-dashboard-config.component.html',
  styleUrls: ['./actions-dashboard-config.component.scss']
})
export class ActionsDashboardConfigComponent implements OnInit {
  viewerAndOrganizations: (GithubViewer | Organization)[];
  model: { [key: string]: boolean };
  appRouting = AppRouting;

  constructor(
    private githubDataService: GithubDataService,
    private andActionDataService: AndActionDataService,
    private router: Router
  ) {}

  ngOnInit() {
    const selectedRepositories = this.andActionDataService
      .actionsDashboardConfig.selectedRepositoriesNameWithOwnerForDashboard;

    // TODO: geschachteltes Subscribe entfernen
    this.githubDataService
      .loadRepositories()
      .subscribe(viewerAndOrganizations => {
        this.viewerAndOrganizations = viewerAndOrganizations;
        from(this.viewerAndOrganizations)
          .pipe(
            flatMap(organization => from(organization.repositories)),
            reduce((acc, current) => {
              acc[current.nameWithOwner] = selectedRepositories.includes(
                current.nameWithOwner
              );
              return acc;
            }, {})
          )
          .subscribe(model => (this.model = model));
      });
  }

  onSave() {
    const selectedRepositoriesForDashboard = Object.keys(this.model).filter(
      repositoryNameWithOwner => this.model[repositoryNameWithOwner]
    );
    this.andActionDataService
      .saveActionsDashboardConfig(
        new ActionsDashboardConfig(selectedRepositoriesForDashboard)
      )
      .subscribe(() => this.router.navigate([AppRouting.DASHBOARD]));
  }
}
