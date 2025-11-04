import { TestBed } from '@angular/core/testing';

import { CommitsGraphService } from './commits-graph.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('CommitsGraphService', () => {
  let service: CommitsGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(CommitsGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
