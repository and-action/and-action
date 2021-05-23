import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { AndActionDataService } from './core/and-action-data.service';
import { AppRouting } from './app-routing';

@Injectable({
  providedIn: 'root',
})
export class RepositoryConfigGuard implements CanActivate {
  constructor(
    private router: Router,
    private andActionDataService: AndActionDataService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const canShowDashboard =
      this.andActionDataService.actionsDashboardConfig
        .selectedRepositoriesNameWithOwnerForDashboard.length > 0;

    if (!canShowDashboard) {
      this.router.navigate([AppRouting.DASHBOARD_CONFIG]);
    }
    return canShowDashboard;
  }
}
