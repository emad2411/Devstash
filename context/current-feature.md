# Item Creation Flow

## Status

Complete

## Goals

- Implement item creation for text-based types (snippets, prompts, notes, commands, links)
- Add `createItemSchema` in `lib/validations.ts`
- Create `createItemAction` in `actions/items.ts` with session check and tag upserting
- Implement `ItemForm` component in `components/items/item-form.tsx` using `useActionState` and `react-hook-form`
- Add "New Item" trigger button to `components/layout/sidebar.tsx`
- Ensure validation for conditionally required fields (e.g., `url` for links)

## Notes

- Strictly follow `useActionState` and Zod pattern established in `actions/auth.ts`
- Form should automatically adjust fields based on selected `ItemType`
- Use `revalidatePath` for UI refresh after success
- **Form Placement Decision Needed:** Step 3 of Phase 2 is building an "Item Drawer." Should we implement the `ItemForm` directly into a new Drawer/Modal right now so the user can trigger it from anywhere, or would you prefer a dedicated page (`/dashboard/items/new`) for this Step 1?

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
- **Rate Limiting for Auth (2026-04-04)**: Upstash Redis rate limiting on all auth endpoints with fail-open behavior, sliding window algorithm, human-readable retry messages
- **Item Listing by Type Page (2026-04-05)**: Dynamic `/dashboard/items/[type]` routes with grid/list toggle, empty states, loading skeletons, sidebar navigation links, and persistent layout via route groups
- **Item Creation Flow (2026-04-07)**: Complete item creation modal with text-based types (snippets, prompts, notes, commands, links), conditional field rendering, tag upserting, and native HTML select dropdown
