import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { QueryParamName } from './query-param-name';

@Injectable({
  providedIn: 'root',
})
export class RepositoryFilterService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  value = toSignal(
    this.route.queryParams.pipe(
      map((queryParams) => queryParams[QueryParamName.REPOSITORY_FILTER] ?? ''),
    ),
  );

  setValue(value: string) {
    const queryParams = { ...this.route.snapshot.queryParams };
    value
      ? (queryParams[QueryParamName.REPOSITORY_FILTER] = value)
      : delete queryParams[QueryParamName.REPOSITORY_FILTER];
    this.router.navigate([], { queryParams });
  }
}
