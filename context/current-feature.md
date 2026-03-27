# Current Feature

Phase 4: User Profile UI Integration

## Status

Completed

## Goals

- Replace the hardcoded demo user with the real authenticated user across the Dashboard and Sidebar.
- Surface `isPro` and avatar image in the Sidebar and Dashboard welcome header.
- Pass a full `dbUser` (including `{ name, email, image, isPro }`) from server components to layout and child components.
- Add a reliable `getInitials(name?)` helper for avatar fallbacks and compute initials dynamically.
- Ensure auth redirects and UI reflect the real user data (name, avatar, plan status).

## Notes

### User Model / Review
- Confirm that querying `prisma.user` in `app/dashboard/page.tsx` to retrieve `isPro` and other fields is acceptable. If so, fetch the full `dbUser` by session user ID.

### Proposed Changes (summary)
- `app/dashboard/page.tsx`: replace `getDemoUser()` with `requireAuth()`; query `prisma.user.findUnique` for full user; pass `user` prop into `DashboardLayout`.
- `components/layout/dashboard-layout.tsx`: update props to accept `user` and forward to `Sidebar`.
- `components/layout/sidebar.tsx`: accept `user`; render `<AvatarImage src={user.image} />`; compute initials from `user.name` or fallback to "Dev"; show `user.name || user.email`; render plan based on `user.isPro`.
- `lib/utils.ts`: add `getInitials(name?: string | null)` helper.
- Update any types/interfaces for `DashboardLayoutProps` and `SidebarProps` to include the `user` shape.

### Verification Plan

Manual steps:
1. Run `npm run dev`.
2. Navigate to `http://localhost:3000` and confirm redirect to `/login` when unauthenticated.
3. Authenticate (Credentials or GitHub OAuth).
4. Verify Dashboard Welcome Header displays your real name.
5. Expand Sidebar: your avatar image should display and name/plan status should match your account.
6. Collapse Sidebar: tooltip should show name and plan over mini-avatar.

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
