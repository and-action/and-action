import { TestBed } from '@angular/core/testing';

import { GithubDataService } from './github-data.service';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GraphQLModule } from '../graphql.module';
import { Apollo } from 'apollo-angular';

// TODO: implement unit tests.
describe('GithubDataService', () => {
  let service: GithubDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule, GraphQLModule, HttpClientTestingModule],
      providers: [Apollo],
    });
    service = TestBed.inject(GithubDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
