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
import { ToolbarComponent } from './toolbar/toolbar.component';
import { HttpUnauthorizedInterceptor } from './http-unauthorized-interceptor';
import { TooltipDirective } from './tooltip.directive';
import { CommitsGraphComponent } from './commits-graph/commits-graph.component';
import { CommitsListComponent } from './commits-list/commits-list.component';

@NgModule({
  declarations: [
    AppComponent,
    ActionsDashboardComponent,
    ActionsDashboardConfigComponent,
    ActionsDashboardItemComponent,
    LoginComponent,
    CommitsDashboardComponent,
    ToolbarComponent,
    TooltipDirective,
    CommitsGraphComponent,
    CommitsListComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule,
    GraphQLModule,
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
