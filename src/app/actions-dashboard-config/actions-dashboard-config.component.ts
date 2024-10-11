import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { AppRouting } from '../app-routing';
import {
  GithubDataService,
  RepositoriesQueryResult,
} from '../core/github-data.service';
import { ActionsDashboardConfig } from '../core/actions-dashboard-config';
import { AndActionDataService } from '../core/and-action-data.service';
import { Router, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { LoadingStatus } from '../loading-status';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { Repository } from '../core/repository';
import { map } from 'rxjs/operators';
import { QueryRef } from 'apollo-angular/query-ref';
import { TRelayPageInfo } from '@apollo/client/utilities/policies/pagination';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    RouterModule,
    AsyncPipe,
    JsonPipe,
  ],
  selector: 'ana-actions-dashboard-config',
  templateUrl: './actions-dashboard-config.component.html',
  styleUrl: './actions-dashboard-config.component.scss',
})
export class ActionsDashboardConfigComponent implements OnInit {
  // protected viewerAndOrganizations: Signal<ViewerOrOrganization[] | undefined>;
  protected viewerRepositories: Signal<
    { repositories: Repository[]; pageInfo: TRelayPageInfo } | undefined
  >;
  protected model: { [key: string]: boolean } = {};
  protected appRouting = AppRouting;
  protected loadingStatus = LoadingStatus.LOADING;
  protected loadingStatusEnum = LoadingStatus;
  protected repositoriesList: Signal<Repository[]>;

  protected githubDataService = inject(GithubDataService);
  private andActionDataService = inject(AndActionDataService);
  private router = inject(Router);
  private viewerRepositoriesQueryResult: QueryRef<RepositoriesQueryResult>;

  constructor() {
    // this.viewerAndOrganizations = toSignal(
    //   this.githubDataService.loadOrganizations(),
    // );

    this.viewerRepositoriesQueryResult =
      this.githubDataService.loadRepositoriesForOwner();

    this.viewerRepositories = toSignal(
      this.viewerRepositoriesQueryResult.valueChanges.pipe(
        map(({ data }) => ({
          repositories: data.viewer.repositories.edges?.map(
            (edge) => edge.node,
          ),
          pageInfo: data.viewer.repositories.pageInfo,
        })),
      ),
    );

    this.repositoriesList = computed(() => {
      if (this.viewerRepositories()?.pageInfo.hasNextPage) {
        this.fetchMore(this.viewerRepositories()?.pageInfo.endCursor);
      }
      return this.viewerRepositories()?.repositories ?? [];
    });

    // this.ownerRepositories = this.githubDataService.loadRepositoriesForOwner();
  }

  fetchMore(endCursor?: string) {
    this.viewerRepositoriesQueryResult.fetchMore({
      // query: repositoriesForOwnerQuery,
      variables: { after: endCursor },
    });
  }

  ngOnInit() {
    // const selectedRepositories =
    //   this.andActionDataService.actionsDashboardConfig
    //     ?.selectedRepositoriesNameWithOwnerForDashboard;
    // this.githubDataService
    //   .loadRepositoriesForOwner()
    //   .valueChanges.subscribe(console.log);

    this.loadingStatus = LoadingStatus.FINISHED;

    // this.githubDataService
    //   .loadViewerAndOrganizations()
    //   .pipe(
    //     tap({
    //       error: () => (this.loadingStatus = LoadingStatus.FAILED),
    //     }),
    //   )
    //   .subscribe(() => {
    //     this.loadingStatus = LoadingStatus.FINISHED;
    //     // this.model = this.viewerAndOrganizations
    //     //   .flatMap((organization) => organization.repositories)
    //     //   .reduce(
    //     //     (acc, current) => ({
    //     //       [current.nameWithOwner]: !!selectedRepositories?.includes(
    //     //         current.nameWithOwner,
    //     //       ),
    //     //       ...acc,
    //     //     }),
    //     //     {},
    //     //   );
    //   });
  }

  isFormValid() {
    return this.model && Object.keys(this.model).some((key) => this.model[key]);
  }

  onSave() {
    if (!this.isFormValid()) {
      return;
    }

    const selectedRepositoriesForDashboard = Object.keys(this.model).filter(
      (repositoryNameWithOwner) => this.model[repositoryNameWithOwner],
    );

    this.andActionDataService
      .saveActionsDashboardConfig(
        new ActionsDashboardConfig(selectedRepositoriesForDashboard),
      )
      .subscribe(() => this.router.navigate([AppRouting.DASHBOARD]));
  }
}
