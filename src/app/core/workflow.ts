import { WorkflowRun } from './workflow-run';

export interface Workflow {
  id: number;
  node_id: string;
  name: string;
  path: string;
  state: string;
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  badge_url: string;
}

export interface WorkflowWithWorkflowRuns {
  workflow: Workflow;
  workflowRuns: WorkflowRun[];
}
