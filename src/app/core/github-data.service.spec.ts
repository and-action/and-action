import { TestBed } from '@angular/core/testing';

import { GithubDataService } from './github-data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GraphQLModule } from '../graphql.module';

// TODO: implement unit tests.
describe('GithubDataService', () => {
  let service: GithubDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GraphQLModule, HttpClientTestingModule],
    });
    service = TestBed.inject(GithubDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
