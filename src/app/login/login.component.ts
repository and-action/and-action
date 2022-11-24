import { Component } from '@angular/core';
import { LoginService } from '../core/login.service';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

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
