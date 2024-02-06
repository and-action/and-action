import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { LoginService } from './core/login.service';
import { AppRouting } from './app-routing';
import { RepositoryFilterService } from './repository-filter.service';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { filter, fromEvent, merge, startWith } from 'rxjs';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

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
  protected isOnline = toSignal(
    merge(fromEvent(window, 'online'), fromEvent(window, 'offline')).pipe(
      startWith(navigator.onLine),
      map(() => navigator.onLine),
    ),
  );

  private loginService = inject(LoginService);
  protected repositoryFilter = inject(RepositoryFilterService);

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
            (window.location.href = `${window.location.protocol}//${window.location.host}/#/${AppRouting.DASHBOARD}`),
        );
    }
  }

  toggleMobileRepositoryFilterForm() {
    this.isFilterToggleButtonActive = !this.isFilterToggleButtonActive;
    if (!this.isFilterToggleButtonActive) {
      this.repositoryFilter.setValue('');
    }
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
