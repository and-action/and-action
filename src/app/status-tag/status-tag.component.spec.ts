import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusTagComponent } from './status-tag.component';
import { StatusTagStatus } from './status-tag-status';
import { By } from '@angular/platform-browser';

describe('StatusTagComponent', () => {
  let component: StatusTagComponent;
  let fixture: ComponentFixture<StatusTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatusTagComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show correct status icon', async () => {
    await checkStatusIcon(StatusTagStatus.WAITING);
    await checkStatusIcon(StatusTagStatus.IN_PROGRESS);
    await checkStatusIcon(StatusTagStatus.SUCCESS);
    await checkStatusIcon(StatusTagStatus.ERROR);
  });

  async function checkStatusIcon(status: StatusTagStatus) {
    component.status = status;
    fixture.detectChanges();
    await fixture.whenStable();

    const svgElement = fixture.debugElement.query(By.css('.tag__status-icon'));
    expect(svgElement.nativeElement.classList).toContain(
      `tag__status-icon--${status}`
    );
  }
});
