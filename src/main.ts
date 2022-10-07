import {
  APP_INITIALIZER,
  enableProdMode,
  ErrorHandler,
  importProvidersFrom,
} from '@angular/core';

import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { RouterModule, Routes } from '@angular/router';
import { AppRouting } from './app/app-routing';
import { ActionsDashboardComponent } from './app/actions-dashboard/actions-dashboard.component';
import { LoginGuard } from './app/login.guard';
import { RepositoryConfigGuard } from './app/repository-config.guard';
import { ActionsDashboardConfigComponent } from './app/actions-dashboard-config/actions-dashboard-config.component';
import { CommitsDashboardComponent } from './app/commits-dashboard/commits-dashboard.component';
import { LoginComponent } from './app/login/login.component';
import { SentryErrorHandler } from './app/sentry-error-handler';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpUnauthorizedInterceptor } from './app/http-unauthorized-interceptor';
import { HttpGithubAuthorizationInterceptor } from './app/http-github-authorization-interceptor';
import { AndActionDataService } from './app/core/and-action-data.service';
import { GraphQLModule } from './app/graphql.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';

if (environment.isEnableProdMode) {
  enableProdMode();
}

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

bootstrapApplication(AppComponent, {
  providers: [
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpUnauthorizedInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpGithubAuthorizationInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (andActionDataService: AndActionDataService) => () =>
        andActionDataService.initActionsDashboardConfig(),
      deps: [AndActionDataService],
      multi: true,
    },
    provideAnimations(),
    importProvidersFrom([
      GraphQLModule,
      HttpClientModule,
      MatSnackBarModule,
      RouterModule.forRoot(routes, { useHash: true }),
    ]),
  ],
}).catch((err) => console.error(err));
