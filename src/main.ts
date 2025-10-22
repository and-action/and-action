import {
  enableProdMode,
  ErrorHandler,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideCheckNoChangesConfig,
  provideZonelessChangeDetection,
} from '@angular/core';

import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { RouterModule, Routes } from '@angular/router';
import { AppRouting } from './app/app-routing';
import { loginGuard } from './app/login.guard';
import { AndActionErrorHandler } from './app/and-action-error-handler';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpUnauthorizedInterceptor } from './app/http-unauthorized-interceptor';
import { HttpGithubAuthorizationInterceptor } from './app/http-github-authorization-interceptor';
import { AndActionDataService } from './app/core/and-action-data.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { DEFAULT_DATE_TIME_FORMAT } from './app/constants';
import { HttpGithubNoCacheInterceptor } from './app/http-github-no-cache-interceptor';
import { provideAndActionApollo } from './provideApollo';

if (environment.isEnableProdMode) {
  enableProdMode();
}

const routes: Routes = [
  {
    path: AppRouting.DASHBOARD,
    loadComponent: () =>
      import('./app/actions-dashboard/actions-dashboard.component').then(
        (mod) => mod.ActionsDashboardComponent,
      ),
    canActivate: [loginGuard],
  },
  {
    path: AppRouting.DASHBOARD_CONFIG,
    loadComponent: () =>
      import(
        './app/actions-dashboard-config/actions-dashboard-config.component'
      ).then((mod) => mod.ActionsDashboardConfigComponent),
    canActivate: [loginGuard],
  },
  {
    path: AppRouting.COMMITS,
    loadComponent: () =>
      import('./app/commits-dashboard/commits-dashboard.component').then(
        (mod) => mod.CommitsDashboardComponent,
      ),
    canActivate: [loginGuard],
  },
  {
    path: AppRouting.LOGIN,
    loadComponent: () =>
      import('./app/login/login.component').then((mod) => mod.LoginComponent),
  },
  {
    path: '',
    redirectTo: `/${AppRouting.DASHBOARD}`,
    pathMatch: 'full',
  },
];

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: {
        dateFormat: DEFAULT_DATE_TIME_FORMAT,
      },
    },
    { provide: ErrorHandler, useClass: AndActionErrorHandler },
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
      provide: HTTP_INTERCEPTORS,
      useClass: HttpGithubNoCacheInterceptor,
      multi: true,
    },
    provideAppInitializer(() => {
      const initializerFn = (
        (andActionDataService: AndActionDataService) => () => {
          andActionDataService.initSelectedTheme();
          andActionDataService.initActionsDashboardConfig();
          andActionDataService.initCommitsDashboardConfig();
        }
      )(inject(AndActionDataService));
      return initializerFn();
    }),
    provideAnimations(),
    provideAndActionApollo(),
    importProvidersFrom([
      MatSnackBarModule,
      RouterModule.forRoot(routes, { useHash: true }),
    ]),
    provideHttpClient(withInterceptorsFromDi()),
    provideZonelessChangeDetection(),
    // TODO: remove as soon as app runs stable without change detection
    provideCheckNoChangesConfig({ exhaustive: true, interval: 10_000 }),
  ],
}).catch((err) => console.error(err));
