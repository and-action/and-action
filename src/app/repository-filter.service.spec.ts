import { TestBed } from '@angular/core/testing';

import { RepositoryFilterService } from './repository-filter.service';

describe('RepositoryFilterService', () => {
  let service: RepositoryFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepositoryFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
