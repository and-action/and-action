import { TestBed } from '@angular/core/testing';

import { GithubDataService } from './github-data.service';
import { ApolloTestingModule } from 'apollo-angular/testing';

// TODO: implement unit tests.
describe('GithubDataService', () => {
  let service: GithubDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule]
    });
    service = TestBed.inject(GithubDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
