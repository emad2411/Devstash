# Current Feature

## Phase 5: Email Verification (Secure Implementation)

## Status

Complete

## Goals

- Implement email verification after credential-based registration using Resend API
- Block login for unverified users (credentials provider)
- Auto-verify GitHub OAuth users (GitHub already verifies emails)
- Verification tokens expire after 1 hour and are securely hashed at rest (SHA-256)
- Provide resend verification email functionality with a 60-second rate limit
- Prevent user/email enumeration at all endpoints

## Notes

### Architecture Overview

Registration (Credentials):
- Validate input (Zod) → Create user (emailVerified = null) → Generate CSPRNG token (48 bytes, hex)
- Store SHA-256(token) + expires + identifier in VerificationToken
- Send raw token via Resend email → Return generic "Check your inbox" (no auto sign-in)

Verify (POST /api/verify-email):
- Receive { token } in request body (NOT query string)
- Compute SHA-256(token) → Find VerificationToken by hashed token → Validate expiry
- Set user.emailVerified = now() → Delete token → Return success

Login (Credentials):
- authorize() checks user.emailVerified → If null → return "EMAIL_NOT_VERIFIED" error
- loginAction surfaces "Please verify your email" message

Login (GitHub OAuth):
- signIn callback in auth.ts (Node runtime) → If emailVerified is null → set to now()

Resend:
- Server action receives email → Check cooldown (VerificationToken.expires - 59 min > now = too soon)
- Always return generic "If an account exists, we sent an email"
- Only actually send if user exists + unverified + cooldown passed

### Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `lib/tokens.ts` | CSPRNG token gen, SHA-256 hashing, cooldown |
| Create | `lib/email.ts` | Resend client |
| Create | `app/api/verify-email/route.ts` | POST endpoint for verification |
| Create | `app/(auth)/verify-email/page.tsx` | Verification entry point |
| Create | `app/(auth)/verify-email/success/page.tsx` | Success landing page |
| Create | `components/auth/verify-email-handler.tsx` | Client-side POSTer |
| Create | `components/auth/resend-verification-form.tsx`| Resend UI |
| Modify | `auth.ts` | Add verification blocks and auto-verify |
| Modify | `actions/auth.ts` | Update registration/login and add resend |
| Modify | `components/auth/register-form.tsx` | Post-registration UI flow |
| Install | `resend` package | SDK |

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
