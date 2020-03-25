import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Repository } from './repository';
import { Organization } from './organization';
import { GithubViewer } from './github-viewer';
import { from } from 'rxjs';
import { flatMap, map, reduce } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Workflow, WorkflowWithWorkflowRuns } from './workflow';
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
        }
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

  loadRepositories() {
    return this.apollo
      .watchQuery<RepositoryQueryResult>({
        query: repositoriesQuery
      })
      .valueChanges.pipe(
        map(queryResult => {
          const viewer: GithubViewer = {
            login: queryResult.data.viewer.login,
            avatarUrl: queryResult.data.viewer.avatarUrl,
            url: queryResult.data.viewer.url,
            repositories: queryResult.data.viewer.repositories.nodes
          };
          const organizations: Organization[] = queryResult.data.viewer.organizations.nodes.map(
            organization => ({
              login: organization.login,
              avatarUrl: organization.avatarUrl,
              url: organization.url,
              repositories: organization.repositories.nodes
            })
          );
          return [viewer, ...organizations];
        })
      );
  }

  loadWorkflows(repositoryNameWithOwner: string) {
    return this.http.get<{ total_count: number; workflows: Workflow[] }>(
      `https://api.github.com/repos/${repositoryNameWithOwner}/actions/workflows`
    );
  }

  loadDefaultBranchWorkflowRuns(repository: Repository) {
    return this.loadWorkflows(repository.nameWithOwner).pipe(
      flatMap(workflowsResult => from(workflowsResult.workflows)),
      flatMap(workflow =>
        this.http
          .get<{ total_count: number; workflow_runs: WorkflowRun[] }>(
            `https://api.github.com/repos/${repository.nameWithOwner}/actions/workflows/${workflow.id}/runs?branch=${repository.defaultBranchRef.name}`
          )
          .pipe(
            map(workflowRunsResult => ({
              workflow,
              workflowRuns: workflowRunsResult.workflow_runs
            }))
          )
      ),
      reduce(
        (acc, workflowWithWorkflowRuns) => [...acc, workflowWithWorkflowRuns],
        [] as WorkflowWithWorkflowRuns[]
      ),
      map(workflowsWithWorkflowRuns =>
        workflowsWithWorkflowRuns.sort((a, b) =>
          a.workflow.name.localeCompare(b.workflow.name)
        )
      )
    );
  }
}
