import { TestBed } from '@angular/core/testing';

import { AndActionDataService } from './and-action-data.service';

describe('AndActionDataService', () => {
  let service: AndActionDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AndActionDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
