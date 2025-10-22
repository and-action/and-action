import { TestBed } from '@angular/core/testing';

import { GithubDataService } from './github-data.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAndActionApollo } from '../../provideApollo';
import { provideZonelessChangeDetection } from '@angular/core';

// TODO: implement unit tests.
describe('GithubDataService', () => {
  let service: GithubDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideAndActionApollo(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(GithubDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
