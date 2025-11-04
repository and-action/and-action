import { TestBed } from '@angular/core/testing';

import { AndActionDataService } from './and-action-data.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AndActionDataService', () => {
  let service: AndActionDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(AndActionDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
