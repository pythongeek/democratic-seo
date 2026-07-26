import { env } from "cloudflare:workers";

let autumnPromise: Promise<Autumn> | undefined;

// Lazy: keeps the ~450 kB autumn-js SDK out of the eager isolate startup
// graph (self-hosted deployments never load it at all); resolves instantly
// after the first call.
function loadAutumn(): Promise<Autumn> {
  const secretKey = env.AUTUMN_SECRET_KEY?.trim();
  if (!secretKey) {
    return Promise.resolve({
      check: async () => ({ allowed: true, balance: 999999 }),
      track: async () => ({}),
      customers: { getOrCreate: async () => ({}) },
    } as unknown as Autumn);
  }

  return (autumnPromise ??= import("autumn-js").then(
    ({ Autumn }) =>
      new Autumn({
        secretKey: () => secretKey,
        // Retries 429/500/502/503/504 (per-operation retryCodes) plus
        // connection errors. Cloudflare 52x statuses are not in the SDK's
        // retry list, so those still surface immediately.
        //
        // These reads/gates (customers.getOrCreate, check) sit on the request
        // hot path, so keep the total retry window short: when Autumn is
        // rate-limiting or slow, an 8s backoff window held the isolate open
        // for seconds on every request and cascaded into region-wide
        // congestion (incident 2026-07-06). Fail fast instead — a caller that
        // can't gate surfaces an error rather than hanging.
        retryConfig: {
          strategy: "backoff",
          backoff: {
            initialInterval: 250,
            maxInterval: 1000,
            exponent: 1.5,
            maxElapsedTime: 2500,
          },
          retryConnectionErrors: true,
        },
      }),
  ));
}

/** Shape-preserving lazy facade over the SDK client: call sites keep the
 *  plain `autumn.check(...)` form. Covers only the methods we use — add a
 *  line here when adopting a new one. */
export const autumn = {
  check: (...args: Parameters<Autumn["check"]>) =>
    loadAutumn().then((client) => client.check(...args)),
  track: (...args: Parameters<Autumn["track"]>) =>
    loadAutumn().then((client) => client.track(...args)),
  customers: {
    getOrCreate: (...args: Parameters<Autumn["customers"]["getOrCreate"]>) =>
      loadAutumn().then((client) => client.customers.getOrCreate(...args)),
  },
};

// track() has no idempotency key, so replaying a deduction Autumn already
// processed (5xx after a successful write, dropped connection) would
// double-charge. Retry only 429s, which are rejected before processing.
export const AUTUMN_TRACK_RETRY_OPTIONS: Parameters<Autumn["track"]>[1] = {
  retryCodes: ["429"],
  retries: {
    strategy: "backoff",
    backoff: {
      initialInterval: 250,
      maxInterval: 2000,
      exponent: 1.5,
      maxElapsedTime: 8000,
    },
    retryConnectionErrors: false,
  },
};
