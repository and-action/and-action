import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AndActionDataService } from './core/and-action-data.service';
import { AppRouting } from './app-routing';

export const repositoryConfigGuard: CanActivateFn = () => {
  const router = inject(Router);
  const andActionDataService = inject(AndActionDataService);

  const canShowDashboard =
    (andActionDataService.actionsDashboardConfig
      ?.selectedRepositoriesNameWithOwnerForDashboard.length ?? 0) > 0;

  if (!canShowDashboard) {
    router.navigate([AppRouting.DASHBOARD_CONFIG]);
  }
  return canShowDashboard;
};
