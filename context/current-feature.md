# Current Feature

Phase 4.1: Refactor Auth Pages to Server Components

## Status

In Progress

## Goals

- Remove `'use client'` from login and register page files
- Create client components for the form logic (`LoginForm`, `RegisterForm`)
- Convert auth pages to server components that render the client form components
- Preserve all existing functionality (form submission, validation, OAuth, error handling)
- Build must pass with no errors

## Notes

### Root Cause Analysis

Two things force `'use client'` on the pages:

| Reason | Code | Impact |
|--------|------|--------|
| `useActionState` hook | `const [state, formAction, isPending] = useActionState(...)` | Requires React client hooks |
| `signIn` from `next-auth/react` | `onClick={() => signIn("github", ...)}` | Client-side import + event handler |

### Proposed Changes

**NEW** `components/auth/login-form.tsx`:
- Extract entire login card (form + OAuth + link) into `'use client'` component
- Contains `useActionState(loginAction, null)` and `signIn("github")`

**NEW** `components/auth/register-form.tsx`:
- Extract entire register card (form + OAuth + link) into `'use client'` component
- Contains `useActionState(registerAction, null)` and `signIn("github")`

**MODIFY** `app/(auth)/login/page.tsx`:
- Remove `'use client'` directive
- Remove all component logic
- Import and render `<LoginForm />` as server component page

**MODIFY** `app/(auth)/register/page.tsx`:
- Remove `'use client'` directive
- Remove all component logic
- Import and render `<RegisterForm />` as server component page

### No Changes Required

- `actions/auth.ts` — Already uses `"use server"`, no changes needed
- `app/(auth)/layout.tsx` — Already a server component, no changes needed

### Verification Plan

**Automated:**
```bash
npm run build
```
Build must pass with no errors.

**Manual:**
1. Run `npm run dev`
2. Navigate to `/login` — form renders, submit works, GitHub OAuth works
3. Navigate to `/register` — form renders, submit works, GitHub OAuth works
4. Submit empty forms — validation errors display inline

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
