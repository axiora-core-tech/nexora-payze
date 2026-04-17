/**
 * Mock API wrapper — simulates network latency for a realistic "loading" feel.
 * Replace this file's internals with real fetch() calls when backend exists;
 * the service interfaces will stay the same.
 */

export type ApiOptions = {
  /** Minimum latency in ms (default 300) */
  minLatency?: number;
  /** Maximum latency in ms (default 900) — actual value is random between min and max */
  maxLatency?: number;
  /** Probability of simulated failure (0-1). Default 0. */
  failureRate?: number;
};

const DEFAULTS: Required<ApiOptions> = {
  minLatency: 300,
  maxLatency: 900,
  failureRate: 0,
};

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Simulate a GET request with latency.
 * Returns the data after the artificial delay, or rejects if failureRate triggers.
 */
export async function mockFetch<T>(data: T, options: ApiOptions = {}): Promise<T> {
  const opts = { ...DEFAULTS, ...options };
  const delay = randomBetween(opts.minLatency, opts.maxLatency);

  await new Promise((resolve) => setTimeout(resolve, delay));

  if (opts.failureRate > 0 && Math.random() < opts.failureRate) {
    throw new Error('Network error — please retry');
  }

  // Return a fresh clone so services can mutate without affecting the source JSON
  return JSON.parse(JSON.stringify(data)) as T;
}

/**
 * Simulate a POST/PUT/DELETE with latency. Slightly slower than GETs by default.
 */
export async function mockMutate<T>(data: T, options: ApiOptions = {}): Promise<T> {
  return mockFetch(data, {
    minLatency: options.minLatency ?? 500,
    maxLatency: options.maxLatency ?? 1200,
    failureRate: options.failureRate ?? 0,
  });
}
