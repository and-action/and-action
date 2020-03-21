import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppRouting } from './app-routing';
import { ActionsDashboardComponent } from './actions-dashboard/actions-dashboard.component';
import { LoginComponent } from './login/login.component';
import { ActionsDashboardConfigComponent } from './actions-dashboard-config/actions-dashboard-config.component';

const routes: Routes = [
  {
    path: AppRouting.DASHBOARD,
    component: ActionsDashboardComponent
  },
  {
    path: AppRouting.DASHBOARD_CONFIG,
    component: ActionsDashboardConfigComponent
  },
  {
    path: AppRouting.LOGIN,
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: AppRouting.LOGIN,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
