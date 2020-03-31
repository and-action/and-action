import { Environment } from './environment-type';
import { EnvironmentName } from './environment-name';

export const environment: Environment = {
  name: EnvironmentName.PRODUCTION,
  isEnableProdMode: true,
  sentryDsn: 'https://d90db2fe777244058c71699ea6fce784@sentry.io/5176642'
};
