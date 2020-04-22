import { TestBed } from '@angular/core/testing';

import { StatusIconService } from './status-icon.service';

describe('StatusIconService', () => {
  let service: StatusIconService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusIconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
