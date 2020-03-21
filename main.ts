import { app, BrowserWindow, screen, session } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { LoginService } from './login.service';
import { DashboardConfigService } from './dashboard-config.service';

let appWindow: BrowserWindow = null;

const args = process.argv.slice(1);
const isServe = args.some(val => val === '--serve');

const loginService = new LoginService(isServe);
const dashboardConfigService = new DashboardConfigService();

function createWindow(): BrowserWindow {
  const size = screen.getPrimaryDisplay().workAreaSize;

  appWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: Math.min(1280, size.width),
    height: Math.min(800, size.height),
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: isServe
    }
  });

  if (isServe) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    appWindow.loadURL(`http://localhost:4200`);
  } else {
    appWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, `dist/index.html`),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  if (isServe) {
    appWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  appWindow.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    appWindow = null;
  });

  return appWindow;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    session.defaultSession.cookies.remove('https://github.com', 'user_session');
    createWindow();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (appWindow === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
