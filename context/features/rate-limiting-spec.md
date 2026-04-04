# Rate Limiting for Auth — DevStash

## Overview

Implement rate limiting on all authentication endpoints to prevent brute-force attacks, credential stuffing, and email-sending abuse. Uses **Upstash Redis** with `@upstash/ratelimit` for serverless-compatible, edge-friendly limiting.

## Current State (Audit)

| File | What exists | Gap |
|------|-------------|-----|
| `actions/auth.ts` | Zod validation, `canResendToken` 60s DB cooldown | No IP-based rate limiting; cooldown is per-email only |
| `auth.ts` | Credentials `authorize()` | No failed-attempt tracking or lockout |
| `app/api/verify-email/route.ts` | Zod validation | No rate limiting on POST |
| `actions/profile.ts` | Auth check | No rate limiting on `changePasswordAction` or `deleteAccountAction` |
| `proxy.ts` (middleware) | Route protection only | No rate limiting layer |
| `lib/tokens.ts` | DB-based 60s cooldown for resend | Not a substitute for true rate limiting |

> **Conclusion:** The app has **no server-side rate limiting**. The only throttle is a DB cooldown on email resend, which is per-email and easily bypassed.

---

## Requirements

- Add rate limiting to all auth-related server actions and API routes
- Use Upstash Redis with `@upstash/ratelimit` (serverless-compatible, no persistent connections)
- Create a reusable `lib/rate-limit.ts` utility
- Return appropriate error responses (`429 Too Many Requests` for API routes, error objects for server actions)
- Display user-friendly error messages on the frontend
- **Fail open**: if Upstash is unavailable, allow the request (don't break auth)

---

## Endpoints to Protect

### Server Actions (`actions/auth.ts`)

| Action | Limit | Window | Key By | Rationale |
|--------|-------|--------|--------|-----------|
| `loginAction` | 5 attempts | 15 min | IP + email | Brute-force prevention |
| `registerAction` | 3 attempts | 1 hour | IP | Spam account prevention |
| `forgotPasswordAction` | 3 attempts | 1 hour | IP | Email flooding prevention |
| `resetPasswordAction` | 5 attempts | 15 min | IP | Token guessing prevention |
| `resendVerificationAction` | 3 attempts | 15 min | IP + email | Email flooding prevention |

### Server Actions (`actions/profile.ts`)

| Action | Limit | Window | Key By | Rationale |
|--------|-------|--------|--------|-----------|
| `changePasswordAction` | 5 attempts | 15 min | User ID | Password guessing prevention |
| `deleteAccountAction` | 3 attempts | 1 hour | User ID | Destructive action protection |

### API Routes

| Route | Limit | Window | Key By | Rationale |
|-------|-------|--------|--------|-----------|
| `POST /api/verify-email` | 5 attempts | 15 min | IP | Token guessing prevention |

---

## Implementation Plan

### 1. Install Dependencies

```bash
npm install @upstash/ratelimit @upstash/redis
```

### 2. Environment Variables

Add to `.env` / `.env.local`:

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> **Note:** Upstash free tier allows 10k commands/day — more than sufficient for auth rate limiting.

### 3. Create Rate Limit Utility

**File:** `lib/rate-limit.ts`

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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
  if (diffSeconds < 60) return `Please try again in ${diffSeconds} seconds.`;

  const minutes = Math.ceil(diffSeconds / 60);
  return `Too many attempts. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`;
}
```

### 4. IP Extraction Helper

Add to `lib/rate-limit.ts`:

```typescript
import { headers } from "next/headers";

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
```

### 5. Integration Pattern — Server Actions

Example for `loginAction`:

```typescript
// In actions/auth.ts
import { rateLimiters, checkRateLimit, formatRetryAfter, getClientIp } from "@/lib/rate-limit";

export async function loginAction(prevState: unknown, formData: FormData) {
  // --- Rate limit check (before any validation or DB call) ---
  const ip = await getClientIp();
  const email = (formData.get("email") as string) || "unknown";
  const rl = await checkRateLimit(rateLimiters.login, `${ip}:${email}`);
  if (!rl.success) {
    return { error: formatRetryAfter(rl.reset) };
  }

  // ... existing validation and signIn logic ...
}
```

### 6. Integration Pattern — API Routes

Example for `POST /api/verify-email`:

```typescript
// In app/api/verify-email/route.ts
import { rateLimiters, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // --- Rate limit check ---
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const rl = await checkRateLimit(rateLimiters.verifyEmail, ip);
  if (!rl.success) {
    return NextResponse.json(
      { error: formatRetryAfter(rl.reset) },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
        },
      }
    );
  }

  // ... existing logic ...
}
```

---

## Error Handling

### Server Actions (used by `useActionState`)
- Return `{ error: "Too many attempts. Please try again in X minutes." }`
- Frontend displays via existing error state in form components
- No code changes needed in form components (they already display `error`)

### API Routes
- Return `429` status with JSON body: `{ error: "Too many attempts. Please try again in X minutes." }`
- Include `Retry-After` header (seconds until reset)
- Frontend handles via existing error response parsing

---

## Files to Create / Modify

| Action | File | Description |
|--------|------|-------------|
| **CREATE** | `lib/rate-limit.ts` | Rate limit utility with all limiter configs |
| **MODIFY** | `actions/auth.ts` | Add rate limit checks to all 5 actions |
| **MODIFY** | `actions/profile.ts` | Add rate limit checks to `changePasswordAction` and `deleteAccountAction` |
| **MODIFY** | `app/api/verify-email/route.ts` | Add rate limit check with 429 response |
| **MODIFY** | `.env.example` *(if exists)* | Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` |

---

## Testing Checklist

- [ ] Verify rate limiting works for each endpoint (hit limit, get error)
- [ ] Verify fail-open: unset env vars → requests succeed without errors
- [ ] Verify retry-after message formats correctly at boundary cases
- [ ] Verify existing DB-based `canResendToken` cooldown still works (defense in depth)
- [ ] Verify no regressions in auth flows (login, register, forgot password, verify email)
- [ ] Verify 429 response includes `Retry-After` header for API routes

---

## Notes

- Upstash free tier: **10k commands/day** — plenty for auth rate limiting
- The existing `canResendToken` / `canResendResetToken` DB cooldowns remain as a **defense-in-depth** layer; they are NOT replaced
- Sliding window algorithm provides smooth limiting (no burst then hard-block)
- Rate limiting is applied at the **start** of each action, before any validation or DB queries (saves resources)
- The `getClientIp` helper uses `next/headers` which works in both server actions and RSCs
- For API routes, IP is extracted from the `Request` object headers directly
