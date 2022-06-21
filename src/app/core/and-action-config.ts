export interface AndActionConfig {
export interface AndActionDeploymentConfig {
  environments?: string[];
  'excluded-workflows'?: string[];
}

export interface AndActionConfig {
  deployment?: AndActionDeploymentConfig;
}
