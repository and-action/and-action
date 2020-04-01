import { Component, OnInit } from '@angular/core';
import { LoginService } from '../core/login.service';
import { Router } from '@angular/router';
import { AppRouting } from '../app-routing';

@Component({
  selector: 'ana-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(private router: Router, private loginService: LoginService) {}

  ngOnInit() {}

  onLoginClick() {
    this.loginService
      .login()
      .subscribe(() => this.router.navigate([AppRouting.DASHBOARD]));
  }
}
