import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AndActionDataService } from './core/and-action-data.service';
import { AppRouting } from './app-routing';

@Injectable({
  providedIn: 'root',
})
export class RepositoryConfigGuard {
  constructor(
    private router: Router,
    private andActionDataService: AndActionDataService
  ) {}

  canActivate() {
    const canShowDashboard =
      (this.andActionDataService.actionsDashboardConfig
        ?.selectedRepositoriesNameWithOwnerForDashboard.length ?? 0) > 0;

    if (!canShowDashboard) {
      this.router.navigate([AppRouting.DASHBOARD_CONFIG]);
    }
    return canShowDashboard;
  }
}
