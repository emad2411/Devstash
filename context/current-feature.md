# Current Feature

Dashboard Server Component Refactor

## Status

Completed

## Tasks

- [x] Create `types/layout.ts` with `SidebarCollection` interface
- [x] Create `components/layout/dashboard-layout.tsx` - Client Component with sidebar state
- [x] Modify `components/layout/sidebar.tsx` - Accept collections via props, remove hardcoded data
- [x] Modify `app/dashboard/page.tsx` - Convert to Server Component, use DashboardLayout
- [x] Run build and verify
- [x] Run lint and verify
- [x] Update `context/current-feature.md`

## Goals

- Convert dashboard page to a Server Component for data-fetching readiness
- Extract layout shell (Navbar + Sidebar) into reusable DashboardLayout Client Component
- Pass mock data from page.tsx to child components via props
- Remove hardcoded collections from Sidebar, make it data-driven

## Notes

- DashboardLayout is a Client Component ('use client') that manages sidebar state
- Page.tsx becomes a Server Component that passes data as props
- Main content flows via children prop for reusability
- Collections data flows top-down: page.tsx → DashboardLayout → Sidebar
- Build passes successfully - confirms Server/Client Component boundaries are correct

## History

- Project setup and boilerplate cleanup
- Dashboard Phase 3: Welcome header, Pinned Collections grid, Recent Items with grid/list toggle
- Refactored dashboard components to use shadcn/ui Button component
- Prisma ORM v7 Setup: Database schema, migrations, seeding with system ItemTypes
- Seed Database: Demo user, 15 tags, 5 collections with 15 items and tag relationships
- Dashboard Server Component Refactor: Extracted DashboardLayout, data flows top-down
