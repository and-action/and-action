export interface Repository {
  name: string;
  nameWithOwner: string;
  description: string;
  isPrivate: boolean;
  defaultBranchRef: Ref;
  url: string;
}

export interface Ref {
  name: string;
}
