import { Component, inject } from '@angular/core';
import { LoginService } from '../core/login.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [MatButtonModule],
  selector: 'ana-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private loginService = inject(LoginService);

  onLoginClick() {
    this.loginService.login();
  }
}
