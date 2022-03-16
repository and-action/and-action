import 'reflect-metadata';
import '../polyfills';

import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CoreModule } from './core/core.module';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ActionsDashboardComponent } from './actions-dashboard/actions-dashboard.component';
import { AndActionDataService } from './core/and-action-data.service';
import { GraphQLModule } from './graphql.module';
import { ActionsDashboardConfigComponent } from './actions-dashboard-config/actions-dashboard-config.component';
import { HttpGithubAuthorizationInterceptor } from './http-github-authorization-interceptor';
import { ActionsDashboardItemComponent } from './actions-dashboard-item/actions-dashboard-item.component';
import { SentryErrorHandler } from './sentry-error-handler';
import { CommitsDashboardComponent } from './commits-dashboard/commits-dashboard.component';
import { HttpUnauthorizedInterceptor } from './http-unauthorized-interceptor';
import { TooltipDirective } from './tooltip.directive';
import { CommitsGraphComponent } from './commits-graph/commits-graph.component';
import { CommitsListComponent } from './commits-list/commits-list.component';
import { StatusTagComponent } from './status-tag/status-tag.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommitInfoComponent } from './commit-info/commit-info.component';

@NgModule({
  declarations: [
    AppComponent,
    ActionsDashboardComponent,
    ActionsDashboardConfigComponent,
    ActionsDashboardItemComponent,
    LoginComponent,
    CommitsDashboardComponent,
    TooltipDirective,
    CommitsGraphComponent,
    CommitsListComponent,
    StatusTagComponent,
    CommitInfoComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule,
    GraphQLModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
  ],
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
