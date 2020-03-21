import 'reflect-metadata';
import '../polyfills';

import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from './core/core.module';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ActionsDashboardComponent } from './actions-dashboard/actions-dashboard.component';
import { AndActionDataService } from './core/and-action-data.service';
import { GraphQLModule } from './graphql.module';

@NgModule({
  declarations: [AppComponent, ActionsDashboardComponent, LoginComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule,
    GraphQLModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (andActionDataService: AndActionDataService) => () =>
        andActionDataService.initActionsDashboardConfig(),
      deps: [AndActionDataService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
