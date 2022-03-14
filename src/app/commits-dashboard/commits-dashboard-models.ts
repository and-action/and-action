import { Ref } from '../core/repository';

export interface RepositoryWithCommits {
  id: string;
  name: string;
  owner: string;
  defaultBranchRef: Ref;
  url: string;
  commits: Commit[];
}

export interface Commit {
  id: string;
  oid: string;
  abbreviatedOid: string;
  commitUrl: string;
  committedDate: Date;
  message: string;
  author?: { name: string; login: string };
  committer: { name: string; email: string };
  parents: string[];
  isMergeCommit: boolean;
  deployments: Deployment[];
}

export interface CommitWithIndentationLevel extends Commit {
  indentationLevel: number;
}

export enum DeploymentState {
  ABANDONED = 'ABANDONED',
  ACTIVE = 'ACTIVE',
  DESTROYED = 'DESTROYED',
  ERROR = 'ERROR',
  FAILURE = 'FAILURE',
  INACTIVE = 'INACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  WAITING = 'WAITING',
}

export const deploymentStateOutputTextMapping = {
  [DeploymentState.ABANDONED]: 'Abandoned',
  [DeploymentState.ACTIVE]: 'Active',
  [DeploymentState.DESTROYED]: 'Destroyed',
  [DeploymentState.ERROR]: 'Error',
  [DeploymentState.FAILURE]: 'Failure',
  [DeploymentState.INACTIVE]: 'Inactive',
  [DeploymentState.IN_PROGRESS]: 'In progress',
  [DeploymentState.PENDING]: 'Pending',
  [DeploymentState.QUEUED]: 'Queued',
  [DeploymentState.WAITING]: 'Waiting',
};

export interface Deployment {
  id: string;
  environment: string;
  timestamp: Date;
  creator: { name: string; login: string };
  state: DeploymentState;
}
