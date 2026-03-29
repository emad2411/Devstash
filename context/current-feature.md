# Current Feature

## Auth Form Validation & Email Token Verification

## Status

Complete

## Goals

- Add robust client-side validation to all auth forms using Zod + React Hook Form + shadcn Field
- Add server-side Zod validation of the email verification token from the URL
- Replace `useActionState` with `react-hook-form` + `Controller` for client-side validation
- Keep server actions unchanged (Zod validation remains as defense-in-depth)
- Remove debug console.log statements from verification handlers

## Notes

### Architecture Shift

The login and register forms currently use `useActionState` with native `<form action={...}>`. This replaces that with `react-hook-form` + `Controller` for client-side validation, then manually calls server actions on submit. The server actions themselves remain unchanged — Zod validation still runs server-side as a second line of defense.

### New Dependencies

Requires installing `react-hook-form` and `@hookform/resolvers`, plus adding `field` and `input-group` shadcn UI components.

### Changes Overview

| Action | File | What Changes |
|--------|------|--------------|
| Install | `package.json` | Add `react-hook-form`, `@hookform/resolvers` |
| Add | `components/ui/field.tsx` | shadcn Field components (via CLI) |
| Add | `components/ui/input-group.tsx` | shadcn InputGroup components (via CLI) |
| Modify | `lib/validations.ts` | Add `resendVerificationSchema`, `verifyEmailTokenSchema` |
| Modify | `components/auth/login-form.tsx` | RHF + Controller + Field + zodResolver |
| Modify | `components/auth/register-form.tsx` | RHF + Controller + Field + zodResolver |
| Modify | `components/auth/resend-verification-form.tsx` | RHF + Controller + Field + zodResolver |
| Modify | `app/(auth)/verify-email/page.tsx` | Zod token validation before rendering |
| Modify | `components/auth/verify-email-handler.tsx` | Remove debug logs |
| Modify | `app/api/verify-email/route.ts` | Zod token validation on API input |

### Validation Behavior

**Login Form:**
- Email: validated as valid email format on blur/change
- Password: validated as min 8 chars on blur/change
- Field errors appear inline below each input via `FieldError`
- Server errors (invalid credentials, unverified email) shown above the submit button

**Register Form:**
- Name: min 1, max 50 chars
- Email: valid email format
- Password: min 8, max 128 chars
- Confirm Password: must match password
- All errors shown inline via `FieldError`

**Resend Verification Form:**
- Email: validated as valid email format
- Field errors inline, success message on valid submission

**Token Validation:**
- Token must be exactly 96 hex characters (48 bytes hex-encoded)
- Server-side validation at page level and API endpoint

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
