import { computed, inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import type { DocumentNode } from 'graphql/index';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { EmptyObject } from 'apollo-angular/types';
import { TRelayPageInfo } from '@apollo/client/utilities/policies/pagination';
import { ApolloQueryResult } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class ApolloUtilsService {
  private apollo = inject(Apollo);

  paginateAll<QueryResultType, ReturnType>(
    query: DocumentNode | TypedDocumentNode<QueryResultType, EmptyObject>,
    getPageInfo: (
      queryValueChanges?: ApolloQueryResult<QueryResultType>,
    ) => TRelayPageInfo | undefined,
    getReturn: (
      queryResult: ApolloQueryResult<QueryResultType> | undefined,
    ) => ReturnType[] | undefined,
  ) {
    const queryRef = this.apollo.watchQuery<QueryResultType>({
      query,
      errorPolicy: 'all',
    });

    const queryValueChanges = toSignal(queryRef.valueChanges);

    return computed<{ value: ReturnType[]; isLoading: boolean }>(() => {
      if (!queryValueChanges()) return { value: [], isLoading: true };
      const pageInfo = getPageInfo(queryValueChanges());
      if (pageInfo?.hasNextPage) {
        queryRef.fetchMore({
          variables: { after: pageInfo.endCursor },
        });
      }
      return {
        value: getReturn(queryValueChanges()) ?? [],
        isLoading: !!pageInfo?.hasNextPage,
      };
    });
  }
}
