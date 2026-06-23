import * as Sentry from "@sentry/react";

let initialized = false;

/** Client-only — durante SSR window não existe, e Sentry.init não roda. */
export function initSentry() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

export { Sentry };
