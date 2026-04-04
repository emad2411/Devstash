import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

/**
 * Creates an Upstash Redis client for rate limiting.
 * Returns null if env vars are missing (fail-open).
 */
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedisClient();

/** Pre-configured rate limiters for each auth action. */
export const rateLimiters = {
  /** Login: 5 attempts per 15 min (IP + email) */
  login: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "rl:login",
      })
    : null,

  /** Register: 3 attempts per hour (IP) */
  register: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        prefix: "rl:register",
      })
    : null,

  /** Forgot password: 3 per hour (IP) */
  forgotPassword: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        prefix: "rl:forgot-password",
      })
    : null,

  /** Reset password: 5 per 15 min (IP) */
  resetPassword: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "rl:reset-password",
      })
    : null,

  /** Resend verification: 3 per 15 min (IP + email) */
  resendVerification: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "15 m"),
        prefix: "rl:resend-verification",
      })
    : null,

  /** Verify email: 5 per 15 min (IP) */
  verifyEmail: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "rl:verify-email",
      })
    : null,

  /** Change password: 5 per 15 min (User ID) */
  changePassword: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "rl:change-password",
      })
    : null,

  /** Delete account: 3 per hour (User ID) */
  deleteAccount: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        prefix: "rl:delete-account",
      })
    : null,
};

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given limiter and identifier.
 * Fails open — returns success if limiter is null or Upstash errors.
 *
 * @param limiter - The rate limiter instance (or null)
 * @param identifier - Composite key (e.g. "IP:email" or "userId")
 * @returns Rate limit result with remaining count and reset timestamp
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) {
    return { success: true, remaining: -1, reset: 0 };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("[rate-limit] Upstash error (failing open):", error);
    return { success: true, remaining: -1, reset: 0 };
  }
}

/**
 * Build a human-readable "try again" message from a reset timestamp.
 */
export function formatRetryAfter(resetMs: number): string {
  const now = Date.now();
  const diffSeconds = Math.ceil((resetMs - now) / 1000);

  if (diffSeconds <= 0) return "Please try again.";
  if (diffSeconds < 60) return `Too many attempts. Please try again in ${diffSeconds} seconds.`;

  const minutes = Math.ceil(diffSeconds / 60);
  return `Too many attempts. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`;
}

/**
 * Extract client IP from request headers.
 * Works with Vercel (x-forwarded-for) and local dev.
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}
