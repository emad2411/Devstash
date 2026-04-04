# Rate Limiting for Auth

## Status

In Progress

## Goals

- [x] Install Upstash dependencies: `@upstash/ratelimit` and `@upstash/redis`
- [x] Create `lib/rate-limit.ts` utility with pre-configured rate limiters for all auth actions
n- [x] Add IP extraction helper using `next/headers`
- [x] Integrate rate limiting into `actions/auth.ts` (login, register, forgotPassword, resetPassword, resendVerification)
- [x] Integrate rate limiting into `actions/profile.ts` (changePassword, deleteAccount)
- [x] Add rate limiting to `POST /api/verify-email` API route with 429 response
- [x] Verify fail-open behavior when Upstash env vars are missing
- [x] Test rate limiting on each endpoint and verify error messages

## Notes

- Uses Upstash Redis with `@upstash/ratelimit` for serverless-compatible rate limiting
- Free tier: 10k commands/day — sufficient for auth rate limiting
- Fail open: if Upstash is unavailable, allow the request (don't break auth)
- Existing DB-based `canResendToken` cooldowns remain as defense-in-depth
- Sliding window algorithm for smooth limiting

### Rate Limit Configuration

| Action | Limit | Window | Key By |
|--------|-------|--------|--------|
| login | 5 | 15 min | IP + email |
| register | 3 | 1 hour | IP |
| forgotPassword | 3 | 1 hour | IP |
| resetPassword | 5 | 15 min | IP |
| resendVerification | 3 | 15 min | IP + email |
| verifyEmail (API) | 5 | 15 min | IP |
| changePassword | 5 | 15 min | User ID |
| deleteAccount | 3 | 1 hour | User ID |

### Required Env Variables

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## History

- Project setup and boilerplate cleanup
- Dashboard Phase 1: Initial dashboard layout with navbar and basic structure
- Dashboard Phase 2: Collections section with cards and item counts
- Dashboard Phase 3: Welcome header, Pinned Collections grid, Recent Items with grid/list toggle
- Refactored dashboard components to use shadcn/ui Button component
- Prisma ORM v7 Setup: Database schema, migrations, seeding with system ItemTypes
- Seed Database: Demo user, 15 tags, 5 collections with 15 items and tag relationships
- Dashboard Server Component Refactor: Extracted DashboardLayout, data flows top-down
- Database-Driven Dashboard: Replaced mock data with Prisma queries, added icon-map.tsx with renderIcon helper, fixed React compiler errors
- **Dashboard & Sidebar Improvements (2026-03-21)**: Montserrat font, sidebar Pro badges, item counts, colored collection circles, pinned collection item icons with +N overflow badge
- **Phase 1: Core Auth Configuration (2026-03-26)**: Edge-compatible auth setup with Next-Auth v5, Prisma adapter, GitHub OAuth + Credentials providers, middleware protection
- **Phase 2: Auth Utilities & Server Actions (2026-03-27)**: Auth helpers, Zod validations, and server actions for login/register/logout
- **Phase 3: Auth UI & Dashboard Protection (2026-03-27)**: Login/register pages with NextAuth.js integration, protected dashboard routes
- **Phase 4: User Profile UI Integration (2026-03-27)**: Replace demo user with real authenticated user and surface plan/avatar in UI
- **Phase 4.1: Auth Pages Server Component Refactor (2026-03-28)**: Converted login/register pages to server components by extracting form logic into client components
- **Sidebar Avatar Dropdown (2026-03-28)**: Added dropdown menu to sidebar avatar with Profile and Sign Out options
- **Phase 5: Email Verification (2026-03-29)**: Secure email verification with Resend API, SHA-256 token hashing, 60-second resend rate limit, GitHub auto-verification
- **Auth Form Validation (2026-03-29)**: React Hook Form + Zod validation, custom GithubIcon, loading states
- **Phase 6: Forgot Password & Fixes (2026-03-30)**: Email sender fix (EMAIL_FROM env var), auto-resend verification on login, complete forgot/reset password flow with token-based reset
- **Profile Page (2026-04-04)**: Standalone /profile route with user info, usage stats, change password form (email users only), delete account dialog with email confirmation, back to dashboard link
