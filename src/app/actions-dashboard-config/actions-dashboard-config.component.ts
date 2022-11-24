import { Component, OnInit } from '@angular/core';
import { AppRouting } from '../app-routing';
import { GithubDataService } from '../core/github-data.service';
import { GithubViewer } from '../core/github-viewer';
import { Organization } from '../core/organization';
import { ActionsDashboardConfig } from '../core/actions-dashboard-config';
import { AndActionDataService } from '../core/and-action-data.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  selector: 'ana-actions-dashboard-config',
  templateUrl: './actions-dashboard-config.component.html',
  styleUrls: ['./actions-dashboard-config.component.scss'],
})
export class ActionsDashboardConfigComponent implements OnInit {
  viewerAndOrganizations?: (GithubViewer | Organization)[];
  model: { [key: string]: boolean } = {};
  appRouting = AppRouting;

  constructor(
    private githubDataService: GithubDataService,
    private andActionDataService: AndActionDataService,
    private router: Router
  ) {}

  ngOnInit() {
    const selectedRepositories =
      this.andActionDataService.actionsDashboardConfig
        ?.selectedRepositoriesNameWithOwnerForDashboard;

    this.githubDataService
      .loadViewerAndOrganizations()
      .subscribe((viewerAndOrganizations) => {
        this.viewerAndOrganizations = viewerAndOrganizations;
        this.model = this.viewerAndOrganizations
          .flatMap((organization) => organization.repositories)
          .reduce(
            (acc, current) => ({
              [current.nameWithOwner]: !!selectedRepositories?.includes(
                current.nameWithOwner
              ),
              ...acc,
            }),
            {}
          );
      });
  }

  isFormValid() {
    return this.model && Object.keys(this.model).some((key) => this.model[key]);
  }

  onSave() {
    if (!this.isFormValid()) {
      return;
    }

    const selectedRepositoriesForDashboard = Object.keys(this.model).filter(
      (repositoryNameWithOwner) => this.model[repositoryNameWithOwner]
    );

    this.andActionDataService
      .saveActionsDashboardConfig(
        new ActionsDashboardConfig(selectedRepositoriesForDashboard)
      )
      .subscribe(() => this.router.navigate([AppRouting.DASHBOARD]));
  }
}
