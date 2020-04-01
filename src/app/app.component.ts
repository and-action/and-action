import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './core/login.service';
import { AppRouting } from './app-routing';

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
  }
}
