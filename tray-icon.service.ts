import { ipcMain, Tray } from 'electron';
import { IpcChannel } from './ipc-channel';
import { StatusIconStatus } from './status-icon-status';
import * as path from 'path';

export class TrayIconService {
  private tray?: Tray;

  constructor() {
    this.initListeners();
  }

  public createTray() {
    const trayIconPath = path.join(__dirname, 'assets/trayTemplate.png');
    this.tray = new Tray(trayIconPath);
    this.tray.setToolTip('🎬 AndAction (GitHub Actions Monitoring)');
  }

  private initListeners() {
    ipcMain.on(
      IpcChannel.SET_TRAY_ICON_STATUS,
      (event: any, status: StatusIconStatus) => {
        if (this.tray) {
          this.tray.setImage(this.getTrayIconForStatus(status));
        }
      }
    );
  }

  private getTrayIconForStatus(status: StatusIconStatus) {
    const iconFileName =
      status === StatusIconStatus.SUCCESS
        ? 'traySuccess.png'
        : status === StatusIconStatus.IN_PROGRESS
        ? 'trayInProgress.png'
        : status === StatusIconStatus.FAILURE
        ? 'trayFailure.png'
        : 'trayTemplate.png';

    return path.join(__dirname, `assets/${iconFileName}`);
  }
}
