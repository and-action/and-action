import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { By } from '@angular/platform-browser';
import { LoginService } from '../core/login.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [LoginComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  it('should call login service and navigate on click', () => {
    const loginService = TestBed.inject(LoginService);
    const loginSpy = spyOn(loginService, 'login');

    const loginButton = fixture.debugElement.query(By.css('.button'));
    loginButton.nativeElement.click();

    expect(loginSpy).toHaveBeenCalled();
  });
});
