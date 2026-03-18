/**
 * Very simple in-memory rate limiter for the campus assistant.
 *
 * - Per-identifier (primarily client IP) counters
 * - Short burst window (per minute)
 * - Daily cap (per 24 hours)
 *
 * This is intentionally lightweight and demo-friendly. It is not
 * suitable for multi-instance or long-running production setups.
 */

type Counter = {
  minuteStart: number;
  minuteCount: number;
  dayStart: number;
  dayCount: number;
};

const MINUTE_WINDOW_MS = 60_000;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;

// Chosen thresholds (per identifier)
export const BURST_LIMIT_PER_MINUTE = 10;
export const DAILY_LIMIT = 150;

// In-memory store of counters keyed by identifier (e.g. IP).
const counters = new Map<string, Counter>();

function getOrCreateCounter(id: string, now: number): Counter {
  let counter = counters.get(id);
  if (!counter) {
    counter = {
      minuteStart: now,
      minuteCount: 0,
      dayStart: now,
      dayCount: 0,
    };
    counters.set(id, counter);
    return counter;
  }

  // Reset minute window if expired
  if (now - counter.minuteStart >= MINUTE_WINDOW_MS) {
    counter.minuteStart = now;
    counter.minuteCount = 0;
  }

  // Reset day window if expired
  if (now - counter.dayStart >= DAY_WINDOW_MS) {
    counter.dayStart = now;
    counter.dayCount = 0;
  }

  return counter;
}

function cleanupOldCounters(now: number) {
  // Very small, opportunistic cleanup to avoid unbounded growth.
  for (const [id, counter] of counters.entries()) {
    if (now - counter.dayStart > DAY_WINDOW_MS * 2) {
      counters.delete(id);
    }
  }
}

export type RateLimitResult = {
  allowed: boolean;
};

/**
 * Derive a simple per-client identifier from the request.
 * Prefers standard proxy headers; falls back to a generic bucket.
 */
export function getClientIdentifier(req: Request): string {
  const headers = req.headers;

  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const firstIp = xff.split(",")[0]?.trim();
    if (firstIp) return `ip:${firstIp}`;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return `ip:${realIp}`;

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return `ip:${cfIp}`;

  return "ip:anonymous";
}

/**
 * Check and record a request against the rate limits.
 *
 * Returns { allowed: false } when either the burst or daily limit is exceeded.
 */
export function checkRateLimit(id: string): RateLimitResult {
  const now = Date.now();
  const counter = getOrCreateCounter(id, now);

  // Increment counts optimistically.
  counter.minuteCount += 1;
  counter.dayCount += 1;

  const overBurst = counter.minuteCount > BURST_LIMIT_PER_MINUTE;
  const overDaily = counter.dayCount > DAILY_LIMIT;

  // Opportunistic cleanup in the background.
  if (Math.random() < 0.01) {
    cleanupOldCounters(now);
  }

  if (overBurst || overDaily) {
    return { allowed: false };
  }

  return { allowed: true };
}

