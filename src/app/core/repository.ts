import { WorkflowWithWorkflowRuns } from './workflow';

export interface Repository {
  id: string;
  name: string;
  owner: { login: string };
  nameWithOwner: string;
  description: string;
  isPrivate: boolean;
  defaultBranchRef: Ref;
  parent: ParentRepository | null;
  url: string;
  workflowsWithWorkflowRuns: WorkflowWithWorkflowRuns[];
}

export interface ParentRepository {
  nameWithOwner: string;
  url: string;
}

export interface Ref {
  name: string;
}
