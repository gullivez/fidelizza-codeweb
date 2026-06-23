// Precisa ser importado antes de qualquer outra coisa em main.ts/main.worker.ts
// para a auto-instrumentação do Sentry funcionar corretamente.
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 0.1,
});
