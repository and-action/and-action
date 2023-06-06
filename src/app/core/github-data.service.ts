import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Repository } from './repository';
import { Organization } from './organization';
import { GithubViewer } from './github-viewer';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Workflow } from './workflow';
import { WorkflowRun } from './workflow-run';
import {
  Commit,
  Deployment,
  RepositoryWithCommits,
} from '../commits-dashboard/commits-dashboard-models';
import { AndActionDataService } from './and-action-data.service';
import YAML from 'yaml';
import { AndActionConfig } from './and-action-config';
import { ApolloError, ApolloQueryResult } from '@apollo/client/core';
import { DeploymentType } from '../deploy-commit-dialog/deployment-type';
import { GraphQLError } from 'graphql/error';

interface GraphQLErrorWithType extends GraphQLError {
  type: 'FORBIDDEN' | 'NOT_FOUND';
}

function isGraphQLErrorWithType(x: GraphQLError): x is GraphQLErrorWithType {
  return 'type' in x;
}

interface RepositoryQueryResult {
  viewer: {
    login: string;
    avatarUrl: string;
    url: string;
    repositories: {
      nodes: Repository[];
    };
    organizations: {
      nodes: (OrganizationNode | null)[];
    };
  };
}

interface CheckSuiteNode {
  app: {
    name: string;
  };
  workflowRun?: {
    workflow: {
      name: string;
    };
  };
  status: string;
  conclusion?: string;
}

interface CommitStateQueryResult {
  node: {
    checkSuites: {
      totalCount: number;
      nodes: CheckSuiteNode[];
    };
  };
}

interface OrganizationNode {
  login: string;
  avatarUrl: string;
  url: string;
  repositories: {
    nodes: Repository[];
  };
}

const repositoriesQuery = gql`
  query Repositories {
    viewer {
      login
      avatarUrl
      url
      repositories(
        first: 100
        orderBy: { direction: ASC, field: NAME }
        affiliations: OWNER
      ) {
        nodes {
          id
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
          repositories(
            first: 100
            orderBy: { direction: ASC, field: NAME }
            affiliations: OWNER
          ) {
            nodes {
              id
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
      id
      url
      defaultBranchRef {
        name
        target {
          ... on Commit {
            id
            oid
            abbreviatedOid
            history(first: 50) {
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
                  committedDate
                  id
                  oid
                  abbreviatedOid
                  message
                  author {
                    name
                    user {
                      login
                    }
                  }
                  committer {
                    name
                    email
                  }
                  deployments(first: 100) {
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
                        latestStatus {
                          logUrl
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
  }
`;

const commitStateQuery = gql`
  query CommitState($id: ID!) {
    node(id: $id) {
      ... on Commit {
        checkSuites(last: 100) {
          totalCount
          nodes {
            app {
              name
            }
            workflowRun {
              workflow {
                name
              }
            }
            status
            conclusion
          }
        }
      }
    }
  }
`;

const andActionConfigsQuery = gql`
  query AndActionConfigs($owner: String!, $name: String!) {
    organisationConfig: repository(owner: $owner, name: ".github") {
      id
      object(expression: "HEAD:.github/andaction.yml") {
        ... on Blob {
          text
        }
      }
    }
    repositoryConfig: repository(owner: $owner, name: $name) {
      id
      object(expression: "HEAD:.github/andaction.yml") {
        ... on Blob {
          text
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GithubDataService {
  private apollo = inject(Apollo);
  private http = inject(HttpClient);
  private andActionDataService = inject(AndActionDataService);

  loadViewerAndOrganizations() {
    return this.apollo
      .watchQuery<RepositoryQueryResult>({
        query: repositoriesQuery,
        errorPolicy: 'all',
      })
      .valueChanges.pipe(
        map(({ data, errors }) => {
          // FORBIDDEN can occur if a public member of an organisation has no access to a repository.
          // In this case, the repository's value is `null`.
          // Therefore, this situation is not an error.
          const isErrorAllowed =
            !errors ||
            errors.every(
              (error) =>
                isGraphQLErrorWithType(error) &&
                error.type === 'FORBIDDEN' &&
                error.path?.at(-1) === 'repositories' &&
                data.viewer.organizations.nodes[
                  error.path?.at(-2) as number
                ] === null
            );
          if (!isErrorAllowed) {
            throw new ApolloError({
              errorMessage: errors.map((error) => error.message).join('\n'),
              graphQLErrors: errors,
            });
          }
          const viewer: GithubViewer = {
            login: data.viewer.login,
            avatarUrl: data.viewer.avatarUrl,
            url: data.viewer.url,
            repositories: data.viewer.repositories.nodes,
          };
          const organizations: Organization[] = data.viewer.organizations.nodes
            .filter((organization) => organization)
            .map((organization) => ({
              login: organization?.login ?? '',
              avatarUrl: organization?.avatarUrl ?? '',
              url: organization?.url ?? '',
              repositories: organization?.repositories.nodes ?? [],
            }));
          return [viewer, ...organizations];
        })
      );
  }

  loadOrganizationsWithSelectedRepositories() {
    const repositoryNameWithOwnerList =
      this.andActionDataService.actionsDashboardConfig
        ?.selectedRepositoriesNameWithOwnerForDashboard ?? [];

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
        this.loadAndActionConfigs(repository.owner.login, repository.name).pipe(
          mergeMap((andActionConfig) =>
            this.loadDefaultBranchWorkflowRuns(
              repository,
              andActionConfig
            ).pipe(
              map((workflowsWithWorkflowRuns) => ({
                ...repository,
                workflowsWithWorkflowRuns,
              }))
            )
          )
        )
      )
    );
  }

  loadRepositoryCommits(owner: string, name: string) {
    return this.apollo
      .query<any>({
        query: repositoryCommitsQuery,
        variables: {
          owner,
          name,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((queryResult) =>
          this.mapRepositoryCommitsQueryResultToRespositoryWithCommits(
            queryResult,
            owner,
            name
          )
        )
      );
  }

  loadCommitState(id: string, andActionConfig: AndActionConfig) {
    return this.apollo
      .watchQuery<CommitStateQueryResult>({
        query: commitStateQuery,
        variables: {
          id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((queryResult) =>
          queryResult.data.node.checkSuites.nodes
            .filter(
              (checkSuite) =>
                !andActionConfig.deployment?.['excluded-workflows']?.includes(
                  checkSuite.workflowRun?.workflow.name ?? checkSuite.app.name
                )
            )
            .every(
              (node) =>
                // TODO: Create enum for status and conclusion
                node.status === 'COMPLETED' && node.conclusion === 'SUCCESS'
            )
        )
      );
  }

  loadAndActionConfigs(
    owner: string,
    name: string
  ): Observable<AndActionConfig> {
    return this.apollo
      .query<any>({
        query: andActionConfigsQuery,
        variables: {
          owner,
          name,
        },
        errorPolicy: 'ignore',
      })
      .pipe(
        map((queryResult) => {
          const getConfig = (yamlText?: string) =>
            yamlText ? YAML.parse(yamlText) : {};

          const organisationConfig = getConfig(
            queryResult.data.organisationConfig?.object?.text
          );
          const repositoryConfig = getConfig(
            queryResult.data.repositoryConfig?.object?.text
          );
          return {
            actions: {
              ...organisationConfig?.actions,
              ...repositoryConfig?.actions,
            },
            deployment: {
              ...organisationConfig?.deployment,
              ...repositoryConfig?.deployment,
            },
          };
        })
      );
  }

  createDeployment(
    repositoryOwner: string,
    repositoryName: string,
    commitSha: string,
    environment: string,
    deploymentType: DeploymentType
  ) {
    // The GraphQL api for creating deployments does not allow the deployment of a commit sha.
    // Therefore, the REST API is used.
    return this.http.post(
      `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/deployments`,
      {
        ref: commitSha,
        environment,
        description: 'Deployed via And Action',
        auto_merge: false,
        // Workflow runs are checked above. So deployments should not check contexts since it ignores
        // excluded-workflows configured in AndAction config.
        required_contexts: [],
        production_environment: ['live', 'production'].includes(environment),
        payload: {
          deployment_type: deploymentType,
        },
      }
    );
  }

  loadWorkflowRuns(organizations: Organization[]) {
    return forkJoin(
      organizations.map((organization) =>
        this.loadRepositoryWorkflowsWithWorkflowRuns(organization).pipe(
          map((repositories) => ({
            ...organization,
            repositories,
          }))
        )
      )
    );
  }

  private loadDefaultBranchWorkflowRuns(
    repository: Repository,
    andActionConfig: AndActionConfig
  ) {
    return this.loadWorkflows(repository.nameWithOwner).pipe(
      map((workflowsResult) =>
        workflowsResult.workflows
          .filter(
            (workflow) =>
              !andActionConfig.actions?.['excluded-workflows']?.includes(
                workflow.name
              )
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      ),
      mergeMap((workflows) =>
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

  private mapRepositoryCommitsQueryResultToRespositoryWithCommits(
    queryResult: ApolloQueryResult<any>,
    owner: string,
    name: string
  ) {
    const commits =
      queryResult.data.repository.defaultBranchRef.target.history.edges.map(
        ({ node }: any): Commit => ({
          id: node.id,
          oid: node.oid,
          abbreviatedOid: node.abbreviatedOid,
          author: {
            name: node.author?.name,
            login: node.author?.user?.login,
          },
          committer: {
            name: node.committer?.name,
            email: node.committer?.email,
          },
          commitUrl: node.commitUrl,
          committedDate: node.committedDate,
          message: node.message,
          isMergeCommit: node.parents.edges.length > 1,
          parents: node.parents.edges.map(
            ({ node: parentNode }: any) => parentNode.oid
          ),
          deployments: node.deployments.edges.map(
            ({ node: deployment }: any): Deployment => ({
              id: deployment.id,
              creator: {
                login: deployment.creator.login,
                name: deployment.creator.name,
              },
              environment: deployment.environment,
              state: deployment.state,
              logUrl: deployment.latestStatus?.logUrl,
              timestamp: new Date(deployment.createdAt),
            })
          ),
        })
      );

    const repository: RepositoryWithCommits = {
      id: queryResult.data.repository.id,
      name,
      owner,
      defaultBranchRef: {
        name: queryResult.data.repository.defaultBranchRef.name,
      },
      url: queryResult.data.repository.url,
      commits,
    };
    return repository;
  }
}
