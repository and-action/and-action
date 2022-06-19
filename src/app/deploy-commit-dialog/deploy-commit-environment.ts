import { DeploymentState } from '../commits-dashboard/commits-dashboard-models';
import { DeploymentType } from './deployment-type';

export interface DeployCommitEnvironment {
  name: string;
  canBeDeployed: { value: true } | { value: false; reason: string };
  deploymentType: DeploymentType;
  deploymentDate?: Date;
  deploymentState?: DeploymentState;
}
