// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `index.ts`, but if you do
// `ng build --env=prod` then `index.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { Environment } from './environment-type';
import { EnvironmentName } from './environment-name';

export const environment: Environment = {
  name: EnvironmentName.DEV,
  isEnableProdMode: false,
  sentryDsn: null,
};
