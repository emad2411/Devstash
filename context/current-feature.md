# Current Feature

Phase 2: Auth Utilities & Server Actions

## Status

Complete

## Goals

- [x] Create `lib/auth-utils.ts` with `getCurrentUser()` and `requireAuth()` helpers
- [x] Create `lib/validations.ts` with Zod schemas for sign-in and sign-up forms
- [x] Create `actions/auth.ts` with `loginAction()`, `registerAction()`, and `logoutAction()`
- [x] Run lint check to verify code quality

## Notes

### Auth Utils Pattern
- `getCurrentUser()` — calls `auth()`, returns `session.user` or `null`
- `requireAuth()` — calls `auth()`, throws/redirects if not authenticated

### Validation Schemas (Zod)
- `signInSchema`: email (valid email), password (min 8 chars)
- `signUpSchema`: extends signInSchema + name field + password confirmation
- Reference: https://zod.dev/api

### Server Actions Pattern
- `loginAction(formData)` — validates with Zod, calls `signIn("credentials", ...)`
- `registerAction(formData)` — validates, hashes password with bcryptjs, creates user via Prisma, then signs in
- `logoutAction()` — calls `signOut()`

### Files Created
- `lib/auth-utils.ts` — Server-side auth helpers
- `lib/validations.ts` — Zod schemas for auth forms
- `actions/auth.ts` — Server actions for login, register, logout

### Verification
Lint passed with no errors in new code.

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
