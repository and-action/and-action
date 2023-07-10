import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  CommitInfoComponent,
  maxCommitMessageLength,
} from './commit-info.component';
import { getCommitMock } from '../../test-utils/data-mocks';
import { By } from '@angular/platform-browser';

describe('CommitInfoComponent', () => {
  let component: CommitInfoComponent;
  let fixture: ComponentFixture<CommitInfoComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(CommitInfoComponent);
    component = fixture.componentInstance;

    component.commit = getCommitMock();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render template correctly', () => {
    const commitMessageElement = fixture.debugElement.query(
      By.css('.commit-message'),
    );
    const commitInfosElement = fixture.debugElement.query(
      By.css('.commit-infos'),
    );
    expect(commitMessageElement.nativeElement.textContent).toContain(
      'Merge pull request #1 from organisation/feature/MD-1234 commit for testing everything',
    );
    expect(commitInfosElement.nativeElement.textContent).toContain(
      'd819c2b • 2022-05-11 • testuser',
    );
  });

  describe('getCommitMessage()', () => {
    it('should highlight moneymeets ticket number', () =>
      expect(
        component.getCommitMessage(
          'feat(commits): implement commits-view MD-1234',
        ),
      ).toEqual(
        'feat(commits): implement commits-view <span class="u-text-bold u-nowrap">MD-1234</span>',
      ));

    it('should add allowed line breaks after slashes', () =>
      expect(
        component.getCommitMessage(
          'Merge pull request #1 from organisation/feature/commits-view',
        ),
      ).toEqual(
        'Merge pull request #1 from organisation/<wbr>feature/<wbr>commits-view',
      ));
  });

  describe('getAbbreviatedCommitMessage()', () => {
    it(`should return full commit message if it is shorter than ${maxCommitMessageLength} characters`, () => {
      const commitMessage =
        'Commit message shorter than maxCommitMessageLength.';
      checkAbbreviatedCommitMessage(commitMessage, commitMessage);
    });

    it(`should return abbreviated commit message followed by ... if it is longer than ${maxCommitMessageLength} characters`, () =>
      checkAbbreviatedCommitMessage(
        'Commit message is longer than maxCommitMessageLength. So it needs to be abbreviated. Therefore, the last sentence is cut off.',
        'Commit message is longer than maxCommitMessageLength. So it needs to be abbreviated. Therefore, the ...',
      ));

    it(`should return full first line of commit message if it is shorter than ${maxCommitMessageLength} characters`, () =>
      checkAbbreviatedCommitMessage(
        'Commit message is longer than maxCommitMessageLength.\nSo it needs to be abbreviated. Therefore, the last sentence is cut off.',
        'Commit message is longer than maxCommitMessageLength.',
      ));

    it(`should return abbreviated first line of commit message followed by ... if it is longer than ${maxCommitMessageLength} characters`, () =>
      checkAbbreviatedCommitMessage(
        'Commit message is longer than maxCommitMessageLength. So it needs to be abbreviated. Therefore, the last sentence of the first line is cut off.\n The next line goes on.',
        'Commit message is longer than maxCommitMessageLength. So it needs to be abbreviated. Therefore, the ...',
      ));

    function checkAbbreviatedCommitMessage(
      commitMessage: string,
      expectedAbbreviatedCommitMessage: string,
    ) {
      expect(component.getAbbreviatedCommitMessage(commitMessage)).toEqual(
        expectedAbbreviatedCommitMessage,
      );
    }
  });

  describe('getCommitMessageTooltip()', () => {
    it('should return full commit message if it contains multiple lines', () =>
      checkCommitMessageTooltip('Message\nthat\ncontains\newlines.'));

    it(`should return full commit message if it is longer than ${maxCommitMessageLength} characters`, () =>
      checkCommitMessageTooltip(
        'Commit message is longer than maxCommitMessageLength.\nSo it is abbreviated in the main view. Therefore, the tooltip must be shown with the full commit message.',
      ));

    it(`should return undefined if commit message is a single line and shorter than ${maxCommitMessageLength} characters`, () =>
      expect(
        component.getCommitMessageTooltip('Short commit message.'),
      ).toBeUndefined());

    function checkCommitMessageTooltip(commitMessage: string) {
      expect(component.getCommitMessageTooltip(commitMessage)).toEqual(
        commitMessage,
      );
    }
  });
});
