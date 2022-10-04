import { Environment } from './environment-type';
import { EnvironmentName } from './environment-name';

export const environment: Environment = {
  name: EnvironmentName.LOCAL,
  isEnableProdMode: false,
  loginApiUrl: 'http://localhost:3000',
  sentryDsn: null,
};
