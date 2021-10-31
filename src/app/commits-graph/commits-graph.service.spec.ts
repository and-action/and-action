import { TestBed } from '@angular/core/testing';

import { CommitsGraphService } from './commits-graph.service';

describe('CommitsGraphService', () => {
  let service: CommitsGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommitsGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
