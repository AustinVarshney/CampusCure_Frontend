/**
 * Frontend error reporting (CC-05).
 *
 * Mirrors `campus_cure_backend/src/services/observability/sentry.ts`: one POST
 * to Sentry's envelope endpoint, no SDK. The reasoning is the same — the SDK
 * is a large dependency for one HTTP call — with one addition that matters
 * more in a browser than on a server: `@sentry/browser` ships its own fetch
 * and history instrumentation, which is a lot of behaviour to add to a bundle
 * that already carries antd, face-api and KaTeX.
 *
 * The DSN is public by design. It is embedded in browser bundles by every
 * Sentry install, which is why it is a `VITE_` variable and why exposing it is
 * not a leak. It only permits *writing* events to one project.
 *
 * What this does NOT do: breadcrumbs, session replay, performance tracing,
 * source-map-resolved stack frames. Stacks point at bundled output. The
 * correlation that makes reports actionable instead comes from `requestId` —
 * see `lastRequestId` below.
 */

const DSN: string | undefined = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT: string =
  import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE ?? "development";

interface ParsedDsn {
  envelopeUrl: string;
  publicKey: string;
}

const parseDsn = (dsn: string | undefined): ParsedDsn | null => {
  if (!dsn) return null;
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, "");
    if (!url.username || !projectId) return null;
    return {
      envelopeUrl: `${url.protocol}//${url.host}/api/${projectId}/envelope/`,
      publicKey: url.username,
    };
  } catch {
    return null;
  }
};

const parsed = parseDsn(DSN);

export const isReportingEnabled = (): boolean => parsed !== null;

/**
 * The `x-request-id` from the most recent API response.
 *
 * This is the join between the two halves of the system. A frontend error is
 * usually downstream of an API call, and the backend stamps every response
 * with an id that appears on its own log lines and Sentry events. Carrying the
 * last one into a frontend report means one id locates both sides — which is
 * what we buy instead of breadcrumbs.
 *
 * Deliberately just the latest, not a history: it is a debugging hint, not an
 * audit trail, and keeping a list in memory for the lifetime of a tab is a
 * slow leak for no extra benefit.
 */
let lastRequestId: string | null = null;

export const noteRequestId = (id: string | null | undefined): void => {
  if (typeof id === "string" && id) lastRequestId = id;
};

export const getLastRequestId = (): string | null => lastRequestId;

/** Set once the user logs in, so a report names who hit the problem. */
let currentUserId: string | null = null;

export const setReportingUser = (userId: string | null): void => {
  currentUserId = userId;
};

const uuid = (): string =>
  crypto.randomUUID?.().replace(/-/g, "") ??
  Math.random().toString(16).slice(2).padEnd(32, "0");

export interface ReportOptions {
  /** Where it happened, e.g. "ErrorBoundary" or "DoubtCommunity". */
  component?: string;
  extra?: Record<string, unknown>;
}

/**
 * Report an error. Never throws.
 *
 * Always logs to the console first: locally that is the only output, and in
 * production it is what a student can be asked to screenshot.
 */
export const reportError = (error: unknown, options: ReportOptions = {}): void => {
  const err = error instanceof Error ? error : new Error(String(error));

  console.error("[campuscure]", err, options.extra ?? {});

  if (!parsed) return;

  const eventId = uuid();
  const event = {
    event_id: eventId,
    timestamp: new Date().toISOString(),
    platform: "javascript",
    level: "error",
    environment: ENVIRONMENT,
    exception: { values: [{ type: err.name, value: err.message }] },
    extra: {
      stack: err.stack,
      // The id that ties this to the backend's own record of the request.
      requestId: lastRequestId,
      ...(options.extra ?? {}),
    },
    tags: {
      ...(options.component ? { component: options.component } : {}),
      ...(lastRequestId ? { request_id: lastRequestId } : {}),
    },
    // Id only. Name and email are personal data, and CC-64's erasure path
    // cannot reach a third-party error tracker once they are copied into it.
    ...(currentUserId ? { user: { id: currentUserId } } : {}),
    request: {
      // Pathname, never the full href: query strings here carry search terms
      // and ids, and occasionally a token pasted into the wrong place.
      url: window.location.pathname,
    },
  };

  const body = [
    JSON.stringify({ event_id: eventId, sent_at: event.timestamp }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(event),
  ].join("\n");

  // `keepalive` so the report still leaves the browser if the error is what
  // caused the user to close the tab - the frontend equivalent of the backend
  // awaiting the send before the lambda freezes.
  void fetch(parsed.envelopeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
      "X-Sentry-Auth": [
        "Sentry sentry_version=7",
        "sentry_client=campuscure-web/1.0",
        `sentry_key=${parsed.publicKey}`,
      ].join(", "),
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Silent. A reporter that surfaces its own failures buries the error it
    // was reporting.
  });
};

/**
 * Catch what React cannot.
 *
 * An error boundary only sees errors thrown during render. A rejected promise
 * in an event handler, or a throw in a `setTimeout`, never reaches it — and
 * before this those were entirely invisible.
 */
export const installGlobalHandlers = (): void => {
  window.addEventListener("error", (event) => {
    reportError(event.error ?? event.message, { component: "window.onerror" });
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason, { component: "unhandledrejection" });
  });
};

export const __testing = { parseDsn };
