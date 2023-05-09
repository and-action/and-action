import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { LoginService } from './core/login.service';
import { AppRouting } from './app-routing';
import { environment } from '../environments/environment';
import { EnvironmentName } from '../environments/environment-name';
import { StatusIconService } from './status-icon.service';
import { RepositoryFilterService } from './repository-filter.service';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterModule,
  ],
  selector: 'ana-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(MatSidenav) protected sideNav?: MatSidenav;
  protected appRouting = AppRouting;

  protected isFilterToggleButtonActive = false;
  protected repositoryFilterValue = '';

  private loginService = inject(LoginService);
  private statusIconService = inject(StatusIconService);
  private repositoryFilterService = inject(RepositoryFilterService);

  constructor(router: Router) {
    router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => this.sideNav?.close());
  }

  ngOnInit() {
    const { code, state } = this.getUrlParams(window.location.href);
    if (code) {
      this.loginService
        .initAccessTokenFromCode(code, state)
        .subscribe(
          () =>
            (window.location.href = `${window.location.protocol}//${window.location.host}/#/${AppRouting.DASHBOARD}`)
        );
    }

    if (environment.name === EnvironmentName.PRODUCTION) {
      this.initGoogleTagManager();
    }

    this.statusIconService.initFavicons();
  }

  onRepositoryFilterChange(value: string) {
    this.repositoryFilterService.setValue(value);
  }

  toggleMobileRepositoryFilterForm() {
    this.isFilterToggleButtonActive = !this.isFilterToggleButtonActive;
    if (!this.isFilterToggleButtonActive) {
      this.repositoryFilterValue = '';
      this.onRepositoryFilterChange(this.repositoryFilterValue);
    }
  }

  private initGoogleTagManager() {
    const trackingId = 'UA-162485821-1';
    const gTagScript = document.createElement('script');
    gTagScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;

    document.getElementsByTagName('head')[0].appendChild(gTagScript);

    const gTagScript2 = document.createElement('script');
    gTagScript2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
  
      gtag('config', '${trackingId}');
    `;

    document.getElementsByTagName('head')[0].appendChild(gTagScript2);
  }

  private getUrlParams(url: string) {
    const start = url.indexOf('?') + 1;
    const end =
      url.indexOf('#') !== -1 && url.indexOf('#') > start
        ? url.indexOf('#')
        : url.length;

    const pairsArray =
      url.indexOf('?') > -1 ? url.slice(start, end).split('&') : [];

    return pairsArray.reduce((cum, pair) => {
      const [key, val] = pair.split('=');
      cum[key] = decodeURIComponent(val);
      return cum;
    }, {} as any);
  }
}
