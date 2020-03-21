export interface Repository {
  name: string;
  nameWithOwner: string;
  description: string;
  isPrivate: boolean;
  defaultBranchRef: Ref;
}

export interface Ref {
  name: string;
}
