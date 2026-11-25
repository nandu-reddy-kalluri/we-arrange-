/**
 * Lightweight, in-memory sliding window rate limiter with auto-cleanup.
 * Zero external runtime dependencies; suitable for edge and Node.js runtimes.
 */

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitRecord>>();

/**
 * Checks whether a key has exceeded its allotted request budget in the given window.
 */
export function checkRateLimit(
  namespace: string,
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map<string, RateLimitRecord>();
    stores.set(namespace, store);
  }

  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    store.set(key, newRecord);

    // Periodic sweep of expired keys when store gets large
    if (store.size > 5000) {
      for (const [k, v] of store.entries()) {
        if (now > v.resetAt) store.delete(k);
      }
    }

    return {
      success: true,
      remaining: Math.max(0, options.max - 1),
      resetAt: newRecord.resetAt,
    };
  }

  if (record.count >= options.max) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: Math.max(0, options.max - record.count),
    resetAt: record.resetAt,
  };
}

/**
 * Extracts client IP address reliably from request headers.
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return "127.0.0.1";
}
