import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppRouting } from './app-routing';
import { ActionsDashboardComponent } from './actions-dashboard/actions-dashboard.component';
import { LoginComponent } from './login/login.component';
import { ActionsDashboardConfigComponent } from './actions-dashboard-config/actions-dashboard-config.component';
import { RepositoryConfigGuard } from './repository-config.guard';
import { CommitsDashboardComponent } from './commits-dashboard/commits-dashboard.component';
import { LoginGuard } from './login.guard';

const routes: Routes = [
  {
    path: AppRouting.DASHBOARD,
    component: ActionsDashboardComponent,
    canActivate: [LoginGuard, RepositoryConfigGuard],
  },
  {
    path: AppRouting.DASHBOARD_CONFIG,
    component: ActionsDashboardConfigComponent,
    canActivate: [LoginGuard],
  },
  {
    path: AppRouting.COMMITS,
    component: CommitsDashboardComponent,
    canActivate: [LoginGuard, RepositoryConfigGuard],
  },
  {
    path: AppRouting.LOGIN,
    component: LoginComponent,
  },
  {
    path: '',
    redirectTo: `/${AppRouting.DASHBOARD}`,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
