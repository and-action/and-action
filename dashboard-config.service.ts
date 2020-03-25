import { app, ipcMain } from 'electron';
import { IpcChannel } from './ipc-channel';
import * as fs from 'fs';
import { ActionsDashboardConfig } from './src/app/core/actions-dashboard-config';
import * as path from 'path';

const DASHBOARD_CONFIG_FILENAME = path.join(
  app.getPath('userData'),
  'dashboard-config.json'
);

export class DashboardConfigService {
  constructor() {
    this.initListeners();
  }

  private initListeners() {
    ipcMain.on(
      IpcChannel.SAVE_ACTIONS_DASHBOARD_CONFIG,
      (event: any, actionsDashboardConfig: ActionsDashboardConfig) =>
        fs.writeFile(
          DASHBOARD_CONFIG_FILENAME,
          JSON.stringify(actionsDashboardConfig, undefined, 2),
          () =>
            event.sender.send(
              IpcChannel.SAVE_ACTIONS_DASHBOARD_CONFIG_RESPONSE,
              true
            )
        )
    );

    // TODO: refactor
    ipcMain.on(IpcChannel.LOAD_ACTIONS_DASHBOARD_CONFIG, (event: any) => {
      if (fs.existsSync(DASHBOARD_CONFIG_FILENAME)) {
        fs.readFile(
          DASHBOARD_CONFIG_FILENAME,
          { encoding: 'utf8' },
          (err, data) =>
            event.sender.send(
              IpcChannel.LOAD_ACTIONS_DASHBOARD_CONFIG_RESPONSE,
              JSON.parse(data)
            )
        );
      } else {
        event.sender.send(
          IpcChannel.LOAD_ACTIONS_DASHBOARD_CONFIG_RESPONSE,
          new ActionsDashboardConfig([])
        );
        return new ActionsDashboardConfig([]);
      }
    });
  }
}
