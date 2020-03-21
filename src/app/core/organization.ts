import { Repository } from './repository';

export interface Organization {
  login: string;
  repositories: Repository[];
}
