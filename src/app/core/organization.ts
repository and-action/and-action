import { Repository } from './repository';

export interface Organization {
  login: string;
  avatarUrl: string;
  url: string;
  repositories: Repository[];
}
