# Current Feature

Phase 1: Core Auth Configuration

## Status

Complete

## Goals

- [x] Install auth dependencies: `next-auth@beta`, `@auth/prisma-adapter`, `zod`
- [x] Create edge-safe `auth.config.ts` with GitHub OAuth + Credentials providers
- [x] Create `auth.ts` with Prisma adapter and JWT session strategy
- [x] Create `proxy.ts` middleware for route protection
- [x] Create `.env.example` with required environment variables
- [x] Run build verification to ensure no edge/Node.js runtime conflicts

## Notes

### Architecture Pattern
Following Auth.js v5 best practices with edge-compatible configuration:
- `auth.config.ts` — Edge-safe, contains only providers and callbacks, NO DB/Prisma imports
- `auth.ts` — Full Node.js config that merges auth.config.ts + adds Prisma adapter
- `proxy.ts` — Edge-compatible middleware for route protection

### Key Technical Decisions
- Use `authorized` callback in middleware to control route access
- Custom sign-in page at `/login`
- Credentials provider with `email` and `password` fields
- Lazy-import `authorize` function to avoid pulling Node.js deps into edge
- JWT session strategy with Prisma adapter

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — Generate with `npx auth secret`
- `AUTH_GITHUB_ID` — GitHub OAuth app ID
- `AUTH_GITHUB_SECRET` — GitHub OAuth app secret

### Files Created
- `auth.config.ts` — Edge-safe auth configuration
- `auth.ts` — Full auth config with Prisma adapter
- `proxy.ts` — Edge middleware for route protection
- `.env.example` — Environment variable template
- `types/next-auth.d.ts` — Extended TypeScript types for session/user
- `app/api/auth/[...nextauth]/route.ts` — API route handler

### Build Verification
Build completed successfully with no edge/Node.js runtime conflicts.

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
