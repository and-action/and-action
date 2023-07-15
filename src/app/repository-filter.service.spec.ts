import { TestBed } from '@angular/core/testing';

import { RepositoryFilterService } from './repository-filter.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import Spy = jasmine.Spy;
import { QueryParamName } from './query-param-name';
import { of } from 'rxjs';

describe('RepositoryFilterService', () => {
  let service: RepositoryFilterService;
  const repositoryName = 'test-repo';

  const configureTestingModule = (queryParams: { [key: string]: string }) => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of(queryParams), snapshot: { queryParams } },
        },
      ],
    });
    service = TestBed.inject(RepositoryFilterService);
  };

  describe('setValue()', () => {
    const queryParams = {
      param1: 'value1',
      param2: 'value2',
    };
    let navigateSpy: Spy;

    beforeEach(() => configureTestingModule(queryParams));

    beforeEach(() => {
      const router = TestBed.inject(Router);
      navigateSpy = spyOn(router, 'navigate');
    });

    it('should set the query parameter', () =>
      checkQueryParams(repositoryName, {
        ...queryParams,
        [QueryParamName.REPOSITORY_FILTER]: repositoryName,
      }));

    it('with empty string should remove the query parameter', () =>
      checkQueryParams('', queryParams));

    function checkQueryParams(
      value: string,
      expectedQueryParams: { [key: string]: string },
    ) {
      service.setValue(value);
      expect(navigateSpy).toHaveBeenCalledWith([], {
        queryParams: expectedQueryParams,
      });
    }
  });

  describe('value', () => {
    it('should return the current query parameter value', () => {
      configureTestingModule({
        [QueryParamName.REPOSITORY_FILTER]: 'test-repo',
      });
      expect(service.value()).toEqual(repositoryName);
    });

    it('should return empty string if query parameter is not set', () => {
      configureTestingModule({});
      expect(service.value()).toEqual('');
    });
  });
});
