import { Ref } from '../core/repository';

export interface RepositoryWithCommits {
  name: string;
  owner: string;
  defaultBranchRef: Ref;
  url: string;
  commits: Commit[];
}

export interface Commit {
  oid: string;
  abbreviatedOid: string;
  commitUrl: string;
  committedDate: Date;
  message: string;
  author: { name: string; login: string };
  parents: string[];
  isMergeCommit: boolean;
  deployments: Deployment[];
}

export interface CommitWithIndentationLevel extends Commit {
  indentationLevel: number;
}

export interface Deployment {
  id: string;
  environment: string;
  timestamp: Date;
  creator: { name: string; login: string };
  state: string;
  isLatestDeploymentForEnvironment: boolean;
}
