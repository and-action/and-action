import { Injectable } from '@angular/core';
import { EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

const loginApiUrl = 'https://and-action-login-api.herokuapp.com';

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
    window.location.href = `${loginApiUrl}/login`;
    return EMPTY;
  }

  initAccessTokenFromCode(code: string) {
    return this.http
      .post(`${loginApiUrl}/access_token`, {
        code
      })
      .pipe(tap((data: any) => (this.myAccessToken = data.access_token)));
  }
}
