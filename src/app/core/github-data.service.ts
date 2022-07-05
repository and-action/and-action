import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { Repository } from './repository';
import { Organization } from './organization';
import { GithubViewer } from './github-viewer';
import { forkJoin, from, Observable, of, timer } from 'rxjs';
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
import { ApolloQueryResult } from '@apollo/client/core';
import { DeploymentType } from '../deploy-commit-dialog/deployment-type';

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
  private repositoryCommitsQueryRef = new Map<string, QueryRef<any>>();

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
    const queryRefKey = `${owner}/${name}`;
    if (!this.repositoryCommitsQueryRef.has(queryRefKey)) {
      this.repositoryCommitsQueryRef.set(
        queryRefKey,
        this.apollo.watchQuery<any>({
          query: repositoryCommitsQuery,
          variables: {
            owner,
            name,
          },
          errorPolicy: 'ignore',
          pollInterval: 60000,
        })
      );
    }

    const queryRef = this.repositoryCommitsQueryRef.get(queryRefKey);

    if (!queryRef) {
      throw new Error('Error creating Apollo query for repository commits.');
    }

    return queryRef.valueChanges.pipe(
      map((queryResult) =>
        this.mapRepositoryCommitsQueryResultToRespositoryWithCommits(
          queryResult,
          owner,
          name
        )
      )
    );
  }

  refetchRepositoryCommits(owner: string, name: string) {
    const queryRefKey = `${owner}/${name}`;
    const queryRef = this.repositoryCommitsQueryRef.get(queryRefKey);

    if (!queryRef) {
      throw new Error('Error creating Apollo query for repository commits.');
    }

    return from(queryRef.refetch()).pipe(
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
        errorPolicy: 'ignore',
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
        description: 'Deployed via AndAction',
        auto_merge: false,
        production_environment: ['live', 'production'].includes(environment),
        payload: {
          deployment_type: deploymentType,
        },
      }
    );
  }

  pollWorkflowRuns(organizations: Organization[]) {
    const sixtySecondsInMillis = 60 * 1000;

    return timer(0, sixtySecondsInMillis).pipe(
      mergeMap(() =>
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
