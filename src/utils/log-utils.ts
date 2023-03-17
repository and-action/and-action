import * as Sentry from '@sentry/browser';

export const captureException = (exception: unknown) =>
  Sentry.captureException(exception);
