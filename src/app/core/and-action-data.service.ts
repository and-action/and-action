import { Injectable } from '@angular/core';
import { ActionsDashboardConfig } from './actions-dashboard-config';
import { of } from 'rxjs';
import {
  CommitsDashboardConfig,
  DEFAULT_COMMITS_HISTORY_COUNT,
} from './commits-dashboard-config';

export enum AndActionTheme {
  AUTO_THEME = 'auto-theme',
  LIGHT_THEME = 'light-theme',
  DARK_THEME = 'dark-theme',
}

const THEME_LOCAL_STORAGE_KEY = 'theme';
const ACTIONS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY = 'actions-dashboard-config';
const COMMITS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY = 'commits-dashboard-config';

@Injectable({
  providedIn: 'root',
})
export class AndActionDataService {
  private mySelectedTheme: AndActionTheme = AndActionTheme.AUTO_THEME;
  private myActionsDashboardConfig?: ActionsDashboardConfig;
  private myCommitsDashboardConfig!: CommitsDashboardConfig;

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

  get commitsDashboardConfig() {
    return this.myCommitsDashboardConfig;
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

  saveCommitsDashboardConfig(commitsDashboardConfig: CommitsDashboardConfig) {
    localStorage.setItem(
      COMMITS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY,
      JSON.stringify(commitsDashboardConfig),
    );
    this.myCommitsDashboardConfig = commitsDashboardConfig;
  }

  initCommitsDashboardConfig() {
    const configString = localStorage.getItem(
      COMMITS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY,
    );
    this.myCommitsDashboardConfig = configString
      ? (JSON.parse(configString) as CommitsDashboardConfig)
      : new CommitsDashboardConfig(DEFAULT_COMMITS_HISTORY_COUNT);
  }
}
