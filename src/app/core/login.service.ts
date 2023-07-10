import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const accessTokenApiKey = 'gh_access_token';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private myAccessToken: string | null =
    localStorage.getItem(accessTokenApiKey);

  private http = inject(HttpClient);

  get accessToken() {
    return this.myAccessToken;
  }

  login(isForce = false) {
    if (isForce) {
      this.myAccessToken = null;
      localStorage.removeItem(accessTokenApiKey);
    }

    window.location.href = `${environment.loginApiUrl}/auth`;
  }

  initAccessTokenFromCode(code: string, state = '') {
    return this.http
      .get(`${environment.loginApiUrl}/access_token`, {
        params: {
          code,
          state,
        },
      })
      .pipe(
        tap((data: any) => {
          this.myAccessToken = data.access_token;
          localStorage.setItem(accessTokenApiKey, data.access_token);
        }),
      );
  }
}
