import { EnvironmentName } from '../src/environments/environment-name';
import * as fs from 'fs';

const environmentConfigParam = process.argv.find(
  arg => arg.indexOf('--configuration') === 0
);

if (!environmentConfigParam) {
  throw new Error(
    'Parameter "--configuration" not found. Creating environment.ts failed.'
  );
}

const environmentConfigName = environmentConfigParam.split('=')[1];
console.log(`Configuration parameter found: ${environmentConfigName}`);

const sentryDsnProd =
  "'https://d90db2fe777244058c71699ea6fce784@sentry.io/5176642'";

const environmentContent = `
import { Environment } from './src/environments/environment-type';
import { EnvironmentName } from './src/environments/environment-name';

export const environment: Environment = {
  name: ${getEnvironmentNameEnumKey(environmentConfigName)},
  isEnableProdMode: ${environmentConfigName === EnvironmentName.PRODUCTION},
  sentryDsn: ${
    environmentConfigName === EnvironmentName.PRODUCTION ? sentryDsnProd : null
  }
};
`;

fs.writeFileSync('./environment.ts', environmentContent);

function getEnvironmentNameEnumKey(configuration: string) {
  switch (configuration) {
    case EnvironmentName.LOCAL:
      return 'EnvironmentName.LOCAL';
    case EnvironmentName.DEV:
      return 'EnvironmentName.DEV';
    case EnvironmentName.PRODUCTION:
      return 'EnvironmentName.PRODUCTION';
  }
}
