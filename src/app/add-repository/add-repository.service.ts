import { inject, Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { TRelayPageInfo } from '@apollo/client/utilities/policies/pagination';
import { ApolloUtilsService } from '../apollo-utils.service';

interface RepositoriesQueryResult {
  viewer: {
    repositories: {
      edges: { node: Repository }[];
      pageInfo: TRelayPageInfo;
    };
  };
}

interface Repository {
  id: string;
  name: string;
  nameWithOwner: string;
  isPrivate: boolean;
  isArchived: boolean;
  url: string;
}

const repositoriesQuery = gql`
  query Repositories($after: String) {
    viewer {
      repositories(
        first: 100
        after: $after
        orderBy: { direction: ASC, field: NAME }
        affiliations: [OWNER, ORGANIZATION_MEMBER, COLLABORATOR]
        ownerAffiliations: [OWNER, ORGANIZATION_MEMBER, COLLABORATOR]
      ) {
        edges {
          node {
            id
            name
            nameWithOwner
            isPrivate
            isArchived
            url
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AddRepositoryService {
  private apolloUtils = inject(ApolloUtilsService);

  repositories = this.apolloUtils.paginateAll<
    RepositoriesQueryResult,
    Repository
  >(
    repositoriesQuery,
    (queryValueChanges) => queryValueChanges?.data.viewer.repositories.pageInfo,
    (queryResult) =>
      queryResult?.data.viewer.repositories.edges
        .map((edge) => edge.node)
        .sort((a, b) => a.nameWithOwner.localeCompare(b.nameWithOwner)),
  );
}