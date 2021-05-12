import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

const loginApiUrl = 'https://andaction-login-api.herokuapp.com';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  get accessToken() {
    return this.myAccessToken;
  }

  private myAccessToken?: string;

  constructor(private http: HttpClient) {}

  login() {
    window.location.href = `${loginApiUrl}/login`;
  }

  initAccessTokenFromCode(code: string) {
    return this.http
      .post(`${loginApiUrl}/access_token`, {
        code,
      })
      .pipe(tap((data: any) => (this.myAccessToken = data.access_token)));
  }
}
