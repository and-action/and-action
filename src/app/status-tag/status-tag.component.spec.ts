import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusTagComponent } from './status-tag.component';
import { StatusTagStatus } from './status-tag-status';
import { By } from '@angular/platform-browser';
import { ComponentRef } from '@angular/core';
import { StatusTagColor } from './status-tag-color';
import { setInputs } from '../../test-utils/input';

describe('StatusTagComponent', () => {
  let componentRef: ComponentRef<StatusTagComponent>;
  let fixture: ComponentFixture<StatusTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(StatusTagComponent);

    componentRef = fixture.componentRef;

    setInputs(componentRef, [
      ['name', ''],
      ['color', StatusTagColor.BLUE],
      ['status', StatusTagStatus.SUCCESS],
      ['link', null],
    ]);
  });

  it('should show correct status icon', async () => {
    await checkStatusIcon(StatusTagStatus.WAITING);
    await checkStatusIcon(StatusTagStatus.IN_PROGRESS);
    await checkStatusIcon(StatusTagStatus.SUCCESS);
    await checkStatusIcon(StatusTagStatus.ERROR);
  });

  it('should contain a link if set', async () => {
    componentRef.setInput('link', 'https://example.com');
    await checkTagElementType('A');
  });

  it('should not contain a link if no link url is set', async () =>
    checkTagElementType('P'));

  async function checkStatusIcon(status: StatusTagStatus) {
    componentRef.setInput('status', status);
    await fixture.whenStable();

    const svgElement = fixture.debugElement.query(By.css('.tag__status-icon'));
    expect(svgElement.nativeElement.classList).toContain(
      `tag__status-icon--${status}`,
    );
  }

  async function checkTagElementType(expectedElementType: 'A' | 'P') {
    await fixture.whenStable();

    const tagElement = fixture.debugElement.query(By.css('.tag'));
    expect(tagElement.nativeElement.tagName).toEqual(expectedElementType);
  }
});
