import { ensureSchema, getSql, useDatabase } from "@/lib/db/client";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const memoryStore = new Map<string, { hits: number; windowStart: number }>();

/**
 * Fixed-window rate limiter. Uses Postgres when available so it works across
 * serverless instances; falls back to in-memory for local development.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const windowMs = windowSeconds * 1000;
  const now = Date.now();

  if (useDatabase()) {
    try {
      await ensureSchema();
      const sql = getSql();
      const cutoff = new Date(now - windowMs).toISOString();

      const rows = await sql`
        INSERT INTO rate_limits (id, hits, window_start)
        VALUES (${key}, 1, ${new Date(now).toISOString()})
        ON CONFLICT (id) DO UPDATE SET
          hits = CASE
            WHEN rate_limits.window_start < ${cutoff} THEN 1
            ELSE rate_limits.hits + 1
          END,
          window_start = CASE
            WHEN rate_limits.window_start < ${cutoff} THEN ${new Date(now).toISOString()}
            ELSE rate_limits.window_start
          END
        RETURNING hits, window_start
      `;

      const row = rows[0] as { hits: number; window_start: string } | undefined;
      const hits = row?.hits ?? 1;
      const windowStart = row?.window_start
        ? new Date(row.window_start).getTime()
        : now;
      const retryAfterSeconds = Math.max(
        0,
        Math.ceil((windowStart + windowMs - now) / 1000),
      );

      return {
        allowed: hits <= limit,
        remaining: Math.max(0, limit - hits),
        retryAfterSeconds: hits <= limit ? 0 : retryAfterSeconds,
      };
    } catch {
      // If the rate-limit store fails, do not block legitimate traffic.
      return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
    }
  }

  const entry = memoryStore.get(key);
  if (!entry || now - entry.windowStart >= windowMs) {
    memoryStore.set(key, { hits: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  entry.hits += 1;
  const retryAfterSeconds = Math.max(
    0,
    Math.ceil((entry.windowStart + windowMs - now) / 1000),
  );
  return {
    allowed: entry.hits <= limit,
    remaining: Math.max(0, limit - entry.hits),
    retryAfterSeconds: entry.hits <= limit ? 0 : retryAfterSeconds,
  };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
