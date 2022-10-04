import { EnvironmentName } from './environment-name';

export interface Environment {
  name: EnvironmentName;
  isEnableProdMode: boolean;
  loginApiUrl: string;
  sentryDsn: string | null;
}
