export enum StatusWithTextStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
}

export interface StatusWithText {
  status: StatusWithTextStatus;
  text: string;
  url?: string;
}
