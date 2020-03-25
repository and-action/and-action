import { Repository } from './repository';

export interface GithubViewer {
  login: string;
  avatarUrl: string;
  url: string;
  repositories: Repository[];
}
