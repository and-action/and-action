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

@Injectable({
  providedIn: 'root'
})
export class GithubDataService {
  constructor(private apollo: Apollo, private http: HttpClient) {}

  loadViewerAndOrganizations() {
    return this.apollo
      .watchQuery<RepositoryQueryResult>({
        query: repositoriesQuery,
        errorPolicy: 'ignore'
      })
      .valueChanges.pipe(
        map(queryResult => {
          const viewer: GithubViewer = {
            login: queryResult.data.viewer.login,
            avatarUrl: queryResult.data.viewer.avatarUrl,
            url: queryResult.data.viewer.url,
            repositories: queryResult.data.viewer.repositories.nodes
          };
          const organizations: Organization[] = queryResult.data.viewer.organizations.nodes
            .filter(organization => organization)
            .map(organization => ({
              login: organization.login,
              avatarUrl: organization.avatarUrl,
              url: organization.url,
              repositories: organization.repositories.nodes
            }));
          return [viewer, ...organizations];
        })
      );
  }

  loadRepositoryWorkflowsWithWorkflowRuns(organization: Organization) {
    return forkJoin(
      organization.repositories.map(repository =>
        this.loadDefaultBranchWorkflowRuns(repository).pipe(
          map(workflowsWithWorkflowRuns => ({
            ...repository,
            workflowsWithWorkflowRuns
          }))
        )
      )
    );
  }

  pollWorkflowRuns(organizations: Organization[]) {
    const _60SecondsInMillis = 60 * 1000;

    return timer(0, _60SecondsInMillis).pipe(
      flatMap(() =>
        forkJoin(
          organizations.map(organization =>
            this.loadRepositoryWorkflowsWithWorkflowRuns(organization).pipe(
              map(repositories => ({
                ...organization,
                repositories
              }))
            )
          )
        )
      )
    );
  }

  private loadDefaultBranchWorkflowRuns(repository: Repository) {
    return this.loadWorkflows(repository.nameWithOwner).pipe(
      map(workflowsResult =>
        workflowsResult.workflows.sort((a, b) => a.name.localeCompare(b.name))
      ),
      flatMap(workflows =>
        workflows.length > 0
          ? forkJoin(
              workflows.map(workflow =>
                this.http
                  .get<{ total_count: number; workflow_runs: WorkflowRun[] }>(
                    `https://api.github.com/repos/${repository.nameWithOwner}/actions/workflows/${workflow.id}/runs?branch=${repository.defaultBranchRef.name}`
                  )
                  .pipe(
                    map(workflowRunsResult => ({
                      workflow,
                      workflowRuns: workflowRunsResult.workflow_runs
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