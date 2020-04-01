import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './core/login.service';
import { AppRouting } from './app-routing';
import { environment } from '../environments/environment';
import { EnvironmentName } from '../environments/environment-name';

@Component({
  selector: 'ana-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams.code) {
        this.loginService
          .initAccessTokenFromCode(queryParams.code)
          .subscribe(() => this.router.navigate(['/', AppRouting.DASHBOARD]));
      }
    });

    if (environment.name === EnvironmentName.PRODUCTION) {
      this.initGoogleTagManager();
    }
  }

  private initGoogleTagManager() {
    const trackingId = 'UA-162485821-1';
    const gTagScript = document.createElement('script');
    gTagScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;

    document.getElementsByTagName('head')[0].appendChild(gTagScript);

    const gTagScript2 = document.createElement('script');
    gTagScript2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
  
      gtag('config', '${trackingId}');
    `;

    document.getElementsByTagName('head')[0].appendChild(gTagScript2);
  }
}
