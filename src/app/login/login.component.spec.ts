import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { LoginService } from '../core/login.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { AppRouting } from '../app-routing';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [LoginComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  it('should call login service and navigate on click', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const loginService = TestBed.inject(LoginService);
    const loginSpy = spyOn(loginService, 'login').and.returnValue(
      of(undefined)
    );

    const loginButton = fixture.debugElement.query(By.css('.button'));
    loginButton.nativeElement.click();

    expect(loginSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith([AppRouting.DASHBOARD]);
  });
});
