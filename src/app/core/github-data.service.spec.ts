import { TestBed } from '@angular/core/testing';

import { GithubDataService } from './github-data.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GraphQLModule } from '../graphql.module';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

// TODO: implement unit tests.
describe('GithubDataService', () => {
  let service: GithubDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GraphQLModule],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(GithubDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
