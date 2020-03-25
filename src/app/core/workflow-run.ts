import { WorkflowRunStatus } from './workflow-run-status';
import { WorkflowRunConclusion } from './workflow-run-conclusion';

export interface WorkflowRun {
  id: number;
  run_number: number;
  status: WorkflowRunStatus;
  conclusion: WorkflowRunConclusion;
  created_at: string;
  updated_at: string;
  html_url: string;
}
