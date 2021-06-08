import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Repository } from './repository';
import { Organization } from './organization';
import { GithubViewer } from './github-viewer';
import { forkJoin, of, timer } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Workflow } from './workflow';
import { WorkflowRun } from './workflow-run';
import {
  Commit,
  Deployment,
  RepositoryWithCommits,
} from '../commits-dashboard/commits-dashboard-models';
import { AndActionDataService } from './and-action-data.service';

interface RepositoryQueryResult {
  viewer: {
    login: string;
    avatarUrl: string;
    url: string;
    repositories: {
      nodes: Repository[];
    };
    organizations: {
      nodes: [
        {
          login: string;
          avatarUrl: string;
          url: string;
          repositories: {
            nodes: Repository[];
          };
        } | null
      ];
    };
  };
}

const repositoriesQuery = gql`
  query Repositories {
    viewer {
      login
      avatarUrl
      url
      repositories(first: 100, orderBy: { direction: ASC, field: NAME }) {
        nodes {
          name
          owner {
            login
          }
          nameWithOwner
          description
          isPrivate
          defaultBranchRef {
            name
          }
          parent {
            nameWithOwner
            url
          }
          url
        }
      }
      organizations(first: 100) {
        nodes {
          login
          avatarUrl
          url
          repositories(first: 100, orderBy: { direction: ASC, field: NAME }) {
            nodes {
              name
              owner {
                login
              }
              nameWithOwner
              description
              isPrivate
              defaultBranchRef {
                name
              }
              parent {
                nameWithOwner
                url
              }
              url
            }
          }
        }
      }
    }
  }
`;

const repositoryCommitsQuery = gql`
  query RepositoryCommits($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      url
      defaultBranchRef {
        name
        target {
          ... on Commit {
            oid
            abbreviatedOid
            history(first: 100) {
              edges {
                node {
                  parents(first: 10) {
                    edges {
                      node {
                        oid
                      }
                    }
                  }
                  commitUrl
                  oid
                  abbreviatedOid
                  message
                  author {
                    name
                    user {
                      login
                    }
                  }
                  deployments(first: 10) {
                    edges {
                      node {
                        id
                        environment
                        createdAt
                        creator {
                          ... on User {
                            login
                            name
                          }
                        }
                        state
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GithubDataService {
  constructor(
    private apollo: Apollo,
    private http: HttpClient,
    private andActionDataService: AndActionDataService
  ) {}

  loadViewerAndOrganizations() {
    return this.apollo
      .watchQuery<RepositoryQueryResult>({
        query: repositoriesQuery,
        errorPolicy: 'ignore',
      })
      .valueChanges.pipe(
        map((queryResult) => {
          const viewer: GithubViewer = {
            login: queryResult.data.viewer.login,
            avatarUrl: queryResult.data.viewer.avatarUrl,
            url: queryResult.data.viewer.url,
            repositories: queryResult.data.viewer.repositories.nodes,
          };
          const organizations: Organization[] =
            queryResult.data.viewer.organizations.nodes
              .filter((organization) => organization)
              .map((organization) => ({
                login: organization.login,
                avatarUrl: organization.avatarUrl,
                url: organization.url,
                repositories: organization.repositories.nodes,
              }));
          return [viewer, ...organizations];
        })
      );
  }

  loadOrganizationsWithSelectedRepositories() {
    const repositoryNameWithOwnerList =
      this.andActionDataService.actionsDashboardConfig
        .selectedRepositoriesNameWithOwnerForDashboard;

    return this.loadViewerAndOrganizations().pipe(
      map((organizations) =>
        organizations
          .map((organization) => ({
            ...organization,
            repositories: organization.repositories.filter(
              (repository) =>
                repositoryNameWithOwnerList.indexOf(
                  repository.nameWithOwner
                ) !== -1
            ),
          }))
          .filter((organization) => organization.repositories.length > 0)
      )
    );
  }

  loadRepositoryWorkflowsWithWorkflowRuns(organization: Organization) {
    return forkJoin(
      organization.repositories.map((repository) =>
        this.loadDefaultBranchWorkflowRuns(repository).pipe(
          map((workflowsWithWorkflowRuns) => ({
            ...repository,
            workflowsWithWorkflowRuns,
          }))
        )
      )
    );
  }

  loadRepositoryCommits(owner: string, name: string) {
    return this.apollo
      .watchQuery<any>({
        query: repositoryCommitsQuery,
        variables: {
          owner,
          name,
        },
        errorPolicy: 'ignore',
      })
      .valueChanges.pipe(
        map((queryResult) => {
          const commits =
            queryResult.data.repository.defaultBranchRef.target.history.edges.map(
              ({ node }): Commit => ({
                oid: node.oid,
                abbreviatedOid: node.abbreviatedOid,
                author: {
                  name: node.author.name,
                  login: node.author.user.login,
                },
                commitUrl: node.commitUrl,
                message: node.message,
                isMergeCommit: node.parents.edges.length > 1,
                deployments: node.deployments.edges.map(
                  ({ node: deployment }): Deployment => ({
                    id: deployment.id,
                    creator: {
                      login: deployment.creator.login,
                      name: deployment.creator.name,
                    },
                    environment: deployment.environment,
                    state: deployment.state,
                    timestamp: new Date(deployment.createdAt),
                    isLatestDeploymentForEnvironment: false,
                  })
                ),
              })
            );

          const latestDeployments = commits.reduce((result, current) => {
            current.deployments.forEach((deployment) => {
              if (
                !result[deployment.environment] ||
                result[deployment.environment] <
                  current.deployments[deployment.environment]
              ) {
                result[deployment.environment] = deployment;
              }
            });
            return result;
          }, {});

          Object.values(latestDeployments).forEach(
            (deployment: Deployment) =>
              (deployment.isLatestDeploymentForEnvironment = true)
          );

          const repository: RepositoryWithCommits = {
            name,
            owner,
            defaultBranchRef: {
              name: queryResult.data.repository.defaultBranchRef.name,
            },
            url: queryResult.data.repository.url,
            commits,
          };
          return repository;
        })
      );
  }

  pollWorkflowRuns(organizations: Organization[]) {
    const sixtySecondsInMillis = 60 * 1000;

    return timer(0, sixtySecondsInMillis).pipe(
      flatMap(() =>
        forkJoin(
          organizations.map((organization) =>
            this.loadRepositoryWorkflowsWithWorkflowRuns(organization).pipe(
              map((repositories) => ({
                ...organization,
                repositories,
              }))
            )
          )
        )
      )
    );
  }

  private loadDefaultBranchWorkflowRuns(repository: Repository) {
    return this.loadWorkflows(repository.nameWithOwner).pipe(
      map((workflowsResult) =>
        workflowsResult.workflows.sort((a, b) => a.name.localeCompare(b.name))
      ),
      flatMap((workflows) =>
        workflows.length > 0
          ? forkJoin(
              workflows.map((workflow) =>
                this.http
                  .get<{ total_count: number; workflow_runs: WorkflowRun[] }>(
                    `https://api.github.com/repos/${repository.nameWithOwner}/actions/workflows/${workflow.id}/runs?branch=${repository.defaultBranchRef.name}`
                  )
                  .pipe(
                    map((workflowRunsResult) => ({
                      workflow,
                      workflowRuns: workflowRunsResult.workflow_runs,
                    })),
                    catchError(() => of({ workflow, workflowRuns: [] }))
                  )
              )
            )
          : of([])
      )
    );
  }

  private loadWorkflows(repositoryNameWithOwner: string) {
    return this.http.get<{ total_count: number; workflows: Workflow[] }>(
      `https://api.github.com/repos/${repositoryNameWithOwner}/actions/workflows`
    );
  }
}
