import { Injectable } from '@angular/core';
import { ActionsDashboardConfig } from './actions-dashboard-config';
import { of } from 'rxjs';

const ACTIONS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY = 'actions-dashboard-config';
@Injectable({
  providedIn: 'root',
})
export class AndActionDataService {
  private myActionsDashboardConfig?: ActionsDashboardConfig;

  get actionsDashboardConfig() {
    return this.myActionsDashboardConfig;
  }

  constructor() {}

  saveActionsDashboardConfig(actionsDashboardConfig: ActionsDashboardConfig) {
    localStorage.setItem(
      ACTIONS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY,
      JSON.stringify(actionsDashboardConfig)
    );
    this.myActionsDashboardConfig = actionsDashboardConfig;
    return of(undefined);
  }

  initActionsDashboardConfig() {
    const configString = localStorage.getItem(
      ACTIONS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY
    );
    this.myActionsDashboardConfig = configString
      ? (JSON.parse(configString) as ActionsDashboardConfig)
      : new ActionsDashboardConfig([]);
  }
}
