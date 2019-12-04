import { version } from '../../package.json';

import * as Integrations from '@sentry/integrations';
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://3774ad85250645f18efe40450f42bb0e@sentry.io/1844161',
  // enabled: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test', // Do not run on your local machine
  environment: process.env.NODE_ENV,
  integrations: [
    new Integrations.RewriteFrames({
      root: __dirname
    })
  ],
  release: version ? version : undefined,
});

export { Sentry }
