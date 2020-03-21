import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Repository } from './repository';
import { Organization } from './organization';
import { GithubViewer } from './github-viewer';
import { map } from 'rxjs/operators';

interface RepositoryQueryResult {
  viewer: {
    login: string;
    repositories: {
      nodes: Repository[];
    };
    organizations: {
      nodes: [
        {
          login: string;
          repositories: {
            nodes: Repository[];
          };
        }
      ];
    };
  };
}

const repositoriesQuery = gql`
  query Repositories {
    viewer {
      login
      repositories(first: 100, orderBy: { direction: ASC, field: NAME }) {
        nodes {
          name
          nameWithOwner
          description
          isPrivate
          defaultBranchRef {
            name
          }
        }
      }
      organizations(first: 100) {
        nodes {
          login
          repositories(first: 100, orderBy: { direction: ASC, field: NAME }) {
            nodes {
              name
              nameWithOwner
              description
              isPrivate
              defaultBranchRef {
                name
              }
            }
          }
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class GithubDataService {
  constructor(private apollo: Apollo) {}

  loadRepositories() {
    return this.apollo
      .watchQuery<RepositoryQueryResult>({
        query: repositoriesQuery
      })
      .valueChanges.pipe(
        map(queryResult => {
          const viewer: GithubViewer = {
            login: queryResult.data.viewer.login,
            repositories: queryResult.data.viewer.repositories.nodes
          };
          const organizations: Organization[] = queryResult.data.viewer.organizations.nodes.map(
            organization => ({
              login: organization.login,
              repositories: organization.repositories.nodes
            })
          );
          return [viewer, ...organizations];
        })
      );
  }
}
