import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

const loginApiUrl = 'https://andaction-login-api.herokuapp.com';

const accessTokenApiKey = 'gh_access_token';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  get accessToken() {
    return this.myAccessToken;
  }

  private myAccessToken?: string;

  constructor(private http: HttpClient) {
    this.myAccessToken = localStorage.getItem(accessTokenApiKey);
  }

  login(isForce = false) {
    if (isForce) {
      this.myAccessToken = undefined;
      localStorage.removeItem(accessTokenApiKey);
    }
    window.location.href = `${loginApiUrl}/login`;
  }

  initAccessTokenFromCode(code: string) {
    return this.http
      .post(`${loginApiUrl}/access_token`, {
        code,
      })
      .pipe(
        tap((data: any) => {
          this.myAccessToken = data.access_token;
          localStorage.setItem(accessTokenApiKey, data.access_token);
        })
      );
  }
}
