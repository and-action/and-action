import { Component } from '@angular/core';
import { LoginService } from '../core/login.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [MatButtonModule],
  selector: 'ana-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(private loginService: LoginService) {}

  onLoginClick() {
    this.loginService.login();
  }
}
