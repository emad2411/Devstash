# Current Feature

## Phase 6: Forgot Password & Fixes

## Status
Complete

## Goals

- [ ] Fix email sender for production (use `EMAIL_FROM` env var with fallback to `onboarding@resend.dev`)
- [ ] Auto-resend verification emails on login with expired/unverified tokens (with cooldown)
- [ ] Implement complete forgot/reset password flow:
  - [ ] Forgot password page with email form
  - [ ] Reset password page with token validation
  - [ ] Server actions for generating/verifying reset tokens
  - [ ] Email template for password reset
  - [ ] Resend cooldown (60s) for reset emails
  - [ ] Generic responses to prevent user enumeration
  - [ ] Security: Only credential-based users can reset passwords (OAuth users excluded)

## Notes

**Token Strategy**: Reuse existing `VerificationToken` model with `reset:` prefix on identifier (e.g., `reset:user@example.com`). No database migration needed.

**Security Features**:
- Same CSPRNG + SHA-256 hashing as email verification
- Same 1-hour expiry
- Same 60-second resend cooldown
- Token consumed (deleted) after successful use
- Generic "If an account exists, we sent an email" response (no user enumeration)

**Email Sender Fix**:
- Replace hardcoded env check with `EMAIL_FROM` env var
- Fallback to `onboarding@resend.dev` for now
- Works in both dev and production until custom domain is verified

**Auto-Resend on Login**:
- When `EMAIL_NOT_VERIFIED` error occurs, automatically resend verification email
- Show blue info banner instead of red error + manual resend link
- Respect 60s cooldown between resends

**Files to Create**:
- `components/auth/forgot-password-form.tsx` - RHF + Zod validation
- `components/auth/reset-password-form.tsx` - RHF + Zod validation
- `app/(auth)/forgot-password/page.tsx` - Server component
- `app/(auth)/reset-password/page.tsx` - Server component with token validation

**Files to Modify**:
- `lib/email.ts` - Add `sendPasswordResetEmail`, fix `FROM_ADDRESS`
- `lib/tokens.ts` - Add reset token functions, clean up console.logs
- `lib/validations.ts` - Add `forgotPasswordSchema`, `resetPasswordSchema`
- `actions/auth.ts` - Add `forgotPasswordAction`, `resetPasswordAction`, auto-resend in `loginAction`
- `components/auth/login-form.tsx` - Blue verification banner, "Forgot password?" link

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
