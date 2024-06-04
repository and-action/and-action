import { Injectable } from '@angular/core';
import { ActionsDashboardConfig } from './actions-dashboard-config';
import { of } from 'rxjs';

export enum AndActionTheme {
  AUTO_THEME = 'auto-theme',
  LIGHT_THEME = 'light-theme',
  DARK_THEME = 'dark-theme',
}

const THEME_LOCAL_STORAGE_KEY = 'theme';
const ACTIONS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY = 'actions-dashboard-config';

@Injectable({
  providedIn: 'root',
})
export class AndActionDataService {
  private mySelectedTheme: AndActionTheme = AndActionTheme.AUTO_THEME;
  private myActionsDashboardConfig?: ActionsDashboardConfig;

  get selectedTheme() {
    return this.mySelectedTheme;
  }

  set selectedTheme(theme: AndActionTheme) {
    this.mySelectedTheme = theme;
    localStorage.setItem(THEME_LOCAL_STORAGE_KEY, this.mySelectedTheme);
  }

  initSelectedTheme() {
    this.mySelectedTheme =
      (localStorage.getItem(THEME_LOCAL_STORAGE_KEY) as AndActionTheme) ??
      AndActionTheme.AUTO_THEME;
  }

  get actionsDashboardConfig() {
    return this.myActionsDashboardConfig;
  }

  saveActionsDashboardConfig(actionsDashboardConfig: ActionsDashboardConfig) {
    localStorage.setItem(
      ACTIONS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY,
      JSON.stringify(actionsDashboardConfig),
    );
    this.myActionsDashboardConfig = actionsDashboardConfig;
    return of(undefined);
  }

  initActionsDashboardConfig() {
    const configString = localStorage.getItem(
      ACTIONS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY,
    );
    this.myActionsDashboardConfig = configString
      ? (JSON.parse(configString) as ActionsDashboardConfig)
      : new ActionsDashboardConfig([]);
  }
}
