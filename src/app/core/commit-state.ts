import { StatusWithText } from './status-with-text';

export interface CommitState extends StatusWithText {
  checkSuites: StatusWithText[];
}
