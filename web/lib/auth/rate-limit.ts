interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();
export function clientAddress(headers: Headers): string {
  return (
    headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
  );
}
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): { allowed: boolean; retryAfterSeconds: number } {
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= limit)
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
/** Forget a bucket, e.g. clear failed-attempt counting after a successful sign-in. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
export function resetRateLimitForTests(): void {
  buckets.clear();
}
