import { Injectable, NgZone } from '@angular/core';
import { ActionsDashboardConfig } from './actions-dashboard-config';
import { IpcChannel } from '../../../ipc-channel';
import { Event } from 'electron';
import { ElectronService } from './electron.service';
import { Subject } from 'rxjs';

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

  initActionsDashboardConfig() {
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
}
