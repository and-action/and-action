import { Injectable } from '@angular/core';
import { EMPTY } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  login() {
    // TODO: Remove return
    window.location.href = 'https://and-action-login-api.herokuapp.com/login';
    return EMPTY;
  }

  initAccessTokenFromCode(code: string) {
    return this.http
      .post('https://and-action-login-api.herokuapp.com/access_token', {
        code
      })
      .pipe(tap((data: any) => (this.myAccessToken = data.access_token)));
  }
}
