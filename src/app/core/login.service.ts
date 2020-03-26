import { Injectable, NgZone } from '@angular/core';
import { ElectronService } from './electron.service';
import { IpcChannel } from '../../../ipc-channel';
import { Event } from 'electron';
import { EMPTY, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  get accessToken() {
    return this.myAccessToken;
  }

  private myAccessToken?: string;

  constructor(
    private electronService: ElectronService,
    private http: HttpClient,
    private zone: NgZone
  ) {}

  login() {
    return this.electronService.isElectron
      ? this.loginElectron()
      : this.loginWeb();
  }

  initAccessTokenFromCode(code: string) {
    return this.http
      .post('https://and-action-login-api.herokuapp.com/access_token', {
        code
      })
      .pipe(tap((data: any) => (this.myAccessToken = data.access_token)));
  }

  private loginElectron() {
    const subject: Subject<void> = new Subject();

    this.electronService.ipcRenderer.once(
      IpcChannel.GITHUB_LOGIN_RESPONSE,
      (event: Event, accessToken: string) => {
        this.myAccessToken = accessToken;
        this.zone.run(() => {
          subject.next();
          subject.complete();
        });
      }
    );

    this.electronService.ipcRenderer.send(IpcChannel.GITHUB_LOGIN);
    return subject.asObservable();
  }

  private loginWeb() {
    window.location.href = 'https://and-action-login-api.herokuapp.com/login';
    return EMPTY;
  }
}
