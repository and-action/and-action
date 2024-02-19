import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusWithTextComponent } from './status-with-text.component';
import { StatusWithTextStatus } from '../core/status-with-text';
import { By } from '@angular/platform-browser';

describe('StatusWithTextComponent', () => {
  let component: StatusWithTextComponent;
  let fixture: ComponentFixture<StatusWithTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusWithTextComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusWithTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render correctly', async () => {
    const text = 'Example text';
    const link = 'https://example.com';
    component.status = StatusWithTextStatus.SUCCESS;
    component.text = text;
    component.link = link;

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
