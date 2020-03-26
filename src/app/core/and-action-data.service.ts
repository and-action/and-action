import { Injectable, NgZone } from '@angular/core';
import { ActionsDashboardConfig } from './actions-dashboard-config';
import { IpcChannel } from '../../../ipc-channel';
import { Event } from 'electron';
import { ElectronService } from './electron.service';
import { of, Subject } from 'rxjs';

const ACTIONS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY = 'actions-dashboard-config';
@Injectable({
  providedIn: 'root'
})
export class AndActionDataService {
  private myActionsDashboardConfig?: ActionsDashboardConfig;

  get actionsDashboardConfig() {
    return this.myActionsDashboardConfig;
  }

  constructor(private electronService: ElectronService, private zone: NgZone) {}

  saveActionsDashboardConfig(actionsDashboardConfig: ActionsDashboardConfig) {
    return this.electronService.isElectron
      ? this.saveActionsDashboardConfigElectron(actionsDashboardConfig)
      : this.saveActionsDashboardConfigWeb(actionsDashboardConfig);
  }

  initActionsDashboardConfig() {
    this.electronService.isElectron
      ? this.initActionsDashboardConfigElectron()
      : this.initActionsDashboardConfigWeb();
  }

  private saveActionsDashboardConfigElectron(
    actionsDashboardConfig: ActionsDashboardConfig
  ) {
    const subject = new Subject<boolean>();
    this.electronService.ipcRenderer.once(
      IpcChannel.SAVE_ACTIONS_DASHBOARD_CONFIG_RESPONSE,
      (event: Event, isSavedSuccessfully: boolean) => {
        this.zone.run(() => {
          this.myActionsDashboardConfig = actionsDashboardConfig;
          subject.next(isSavedSuccessfully);
          subject.complete();
        });
      }
    );

    this.electronService.ipcRenderer.send(
      IpcChannel.SAVE_ACTIONS_DASHBOARD_CONFIG,
      actionsDashboardConfig
    );
    return subject.asObservable();
  }

  private saveActionsDashboardConfigWeb(
    actionsDashboardConfig: ActionsDashboardConfig
  ) {
    localStorage.setItem(
      ACTIONS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY,
      JSON.stringify(actionsDashboardConfig)
    );
    this.myActionsDashboardConfig = actionsDashboardConfig;
    return of(undefined);
  }

  private initActionsDashboardConfigElectron() {
    const subject = new Subject<void>();
    this.electronService.ipcRenderer.once(
      IpcChannel.LOAD_ACTIONS_DASHBOARD_CONFIG_RESPONSE,
      (event: Event, actionsDashboardConfig: ActionsDashboardConfig) => {
        this.myActionsDashboardConfig = actionsDashboardConfig;
        subject.next();
        subject.complete();
      }
    );

    this.electronService.ipcRenderer.send(
      IpcChannel.LOAD_ACTIONS_DASHBOARD_CONFIG
    );
    return subject.asObservable().toPromise();
  }

  private initActionsDashboardConfigWeb() {
    const configString = localStorage.getItem(
      ACTIONS_DASHBOARD_CONFIG_LOCAL_STORAGE_KEY
    );
    this.myActionsDashboardConfig = configString
      ? (JSON.parse(configString) as ActionsDashboardConfig)
      : new ActionsDashboardConfig([]);
  }
}
