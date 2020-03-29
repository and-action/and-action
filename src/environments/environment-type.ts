import { EnvironmentName } from './environment-name';

export interface Environment {
  name: EnvironmentName;
  isEnableProdMode: boolean;
  sentryDsn: string | null;
}
