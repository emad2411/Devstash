# Current Feature

Database-Driven Dashboard & Sidebar

## Status

Completed

## Tasks

- [x] Install `server-only` package
- [x] Create `lib/queries.ts` - Server-only Prisma queries for dashboard data
- [x] Create `lib/icon-map.ts` - Centralized Lucide icon resolver
- [x] Create `types/dashboard.ts` - Serializable types for dashboard components
- [x] Modify `types/layout.ts` - Add `SidebarNavItem` and `DashboardStats` types
- [x] Modify `components/layout/dashboard-layout.tsx` - Add `navItems` prop
- [x] Modify `components/layout/sidebar.tsx` - Accept `navItems` prop, remove hardcoded array
- [x] Modify `app/dashboard/page.tsx` - Replace mock imports with Prisma queries
- [x] Modify `components/dashboard/welcome-header.tsx` - Accept `totalItems` prop
- [x] Modify `components/dashboard/pinned-collections.tsx` - Use `DashboardCollection`, remove itemTypes prop
- [x] Modify `components/dashboard/collection-card.tsx` - Use `DashboardCollection`, use shared `getIcon()`
- [x] Modify `components/dashboard/recent-items.tsx` - Use `DashboardItem`, remove itemTypes prop
- [x] Modify `components/dashboard/item-card.tsx` - Use `DashboardItem`, real tags, shared `getIcon()`
- [x] Run build and verify
- [x] Run lint and verify
- [x] Update `context/current-feature.md`

## Goals

- Replace all mock data in the dashboard and sidebar with real Prisma database queries
- Keep the page as a Server Component that fetches all data top-down
- ItemTypes (nav links) come from DB since users can create custom types
- Create reusable icon resolver utility for Lucide icon names stored as strings in DB

## Notes

- Using temporary `getDemoUser()` helper that fetches seeded demo user by email (`demo@devstash.io`)
- No auth yet - will be replaced with real session-based auth in future feature
- "All Items" entry is a static entry prepended to DB-fetched types in sidebar
- Each query uses Prisma `select` to limit fields and `_count` for collection item counts
- Dates are serialized as ISO strings for Server→Client boundary

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
