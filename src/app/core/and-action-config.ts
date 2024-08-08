export interface AndActionActionsConfig {
  'excluded-workflows'?: string[];
}

export interface Environment {
  name: string;
  requires?: Environment[];
}

export interface AndActionDeploymentConfig {
  environments?: Environment[];
  'excluded-workflows'?: string[];
}

export interface AndActionConfig {
  actions?: AndActionActionsConfig;
  deployment?: AndActionDeploymentConfig;
}
