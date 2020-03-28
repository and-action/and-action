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
import { GraphQLError } from 'graphql';

@Component({
  selector: 'app-actions-dashboard-config',
  templateUrl: './actions-dashboard-config.component.html',
  styleUrls: ['./actions-dashboard-config.component.scss']
})
export class ActionsDashboardConfigComponent implements OnInit {
  viewerAndOrganizations: (GithubViewer | Organization)[];
  errors: readonly GraphQLError[];
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
      .subscribe(repositories => {
        this.viewerAndOrganizations = repositories.viewerAndOrganizations;
        this.errors = repositories.errors;
        console.error(this.errors);
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

  isFormValid() {
    return this.model && Object.keys(this.model).some(key => this.model[key]);
  }

  onSave() {
    if (!this.isFormValid()) {
      return;
    }

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
