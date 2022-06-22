export interface AndActionActionsConfig {
  'excluded-workflows'?: string[];
}

export interface AndActionDeploymentConfig {
  environments?: string[];
  'excluded-workflows'?: string[];
}

export interface AndActionConfig {
  actions?: AndActionActionsConfig;
  deployment?: AndActionDeploymentConfig;
}
