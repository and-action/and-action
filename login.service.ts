import { BrowserWindow, ipcMain, screen } from 'electron';
import { IpcChannel } from './ipc-channel';
import axios from 'axios';

const BASE_URL = 'https://and-action-login-api.herokuapp.com';

export class LoginService {
  constructor(private isServe: boolean) {
    this.initListeners();
  }

  private initListeners() {
    ipcMain.on(IpcChannel.GITHUB_LOGIN, (event: any) => {
      this.createLoginWindow().then(accessToken =>
        event.sender.send(IpcChannel.GITHUB_LOGIN_RESPONSE, accessToken)
      );
    });
  }

  private createLoginWindow() {
    return new Promise<string>((resolve, reject) => {
      const size = screen.getPrimaryDisplay().workAreaSize;

      let loginWindow: BrowserWindow | null = new BrowserWindow({
        x: 0,
        y: 0,
        width: Math.min(500, size.width),
        height: Math.min(800, size.height),
        webPreferences: {
          nodeIntegration: true,
          allowRunningInsecureContent: this.isServe
        }
      });

      loginWindow.loadURL(`${BASE_URL}/login`);

      if (this.isServe) {
        loginWindow.webContents.openDevTools();
      }

      loginWindow.webContents.on('did-start-navigation', (event, newUrl) => {
        const url = new URL(newUrl);
        if (url.searchParams.has('code')) {
          axios
            .post(
              `${BASE_URL}/access_token`,
              {
                code: url.searchParams.get('code')
              },
              {
                headers: {
                  'content-type': 'application/json'
                }
              }
            )
            .then(response => {
              resolve(response.data.access_token);
              loginWindow.close();
            })
            .catch(() => reject('Failed to get GitHub Access Token'));
        }
      });

      // Emitted when the window is closed.
      loginWindow.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        loginWindow = null;
      });
    });
  }
}
