import { Repository } from './repository';

export interface GithubViewer {
  login: string;
  repositories: Repository[];
}
