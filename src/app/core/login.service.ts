import { Injectable, NgZone } from '@angular/core';
import { ElectronService } from './electron.service';
import { IpcChannel } from '../../../ipc-channel';
import { Event } from 'electron';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  get accessToken() {
    return this.myAccessToken;
  }

  private myAccessToken?: string;

  constructor(private electronService: ElectronService, private zone: NgZone) {}

  login() {
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
}
