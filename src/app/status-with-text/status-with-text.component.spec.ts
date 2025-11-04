import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusWithTextComponent } from './status-with-text.component';
import { StatusWithTextStatus } from '../core/status-with-text';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

describe('StatusWithTextComponent', () => {
  let fixture: ComponentFixture<StatusWithTextComponent>;

  const text = 'Example text';
  const link = 'https://example.com';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusWithTextComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusWithTextComponent);
    const componentRef = fixture.componentRef;
    componentRef.setInput('status', StatusWithTextStatus.SUCCESS);
    componentRef.setInput('text', text);
    componentRef.setInput('link', link);

    fixture.detectChanges();
  });

  it('should render correctly', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const iconElement = fixture.debugElement.query(
      By.css(`.status__icon--${StatusWithTextStatus.SUCCESS}`),
    );
    const textLinkElement = fixture.debugElement.query(By.css('a.status-text'));

    expect(iconElement).not.toBeNull();
    expect(textLinkElement.nativeElement.text).toContain(text);
    expect(textLinkElement.attributes.href).toEqual(link);
  });
});
