# Current Feature

Dashboard & Sidebar Improvements

## Status

Completed

## Goals

1. ✅ **Font Update**: Import Montserrat replacing Geist in app/layout.tsx and update globals.css
2. ✅ **Sidebar Updates**: Reorder item types (File/Image at end), add "Pro" badges for File/Image, show item counts, replace folder icons with colored circles based on most common item type
3. ✅ **Pinned Collections Badges**: Fetch top 3 items per collection, display their icons in collection cards, show +N badge when more than 3 items
4. ✅ **Most Common Item Type**: Compute most frequent item type per collection for sidebar color coding

## Tasks

- [x] Update font from Geist to Montserrat in app/layout.tsx
- [x] Update --font-sans mapping in app/globals.css
- [x] Sort itemTypes in app/dashboard/page.tsx so File and Image appear at the end
- [x] Add "Pro" badge conditionally in sidebar NavItem for file and image types
- [x] Display itemCount on the right side of NavItem labels
- [x] Replace Folder icon with colored circle in CollectionItem (use most common item type color)
- [x] Update getPinnedCollections query to fetch top 3 items with their types
- [x] Update DashboardCollection type to include topItems
- [x] Render top 3 item icons in collection-card.tsx using renderIcon
- [x] Show +N badge in collection-card when itemCount > 3
- [x] Update getCollections query to compute most common item type per collection

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
- Dashboard & Sidebar Improvements: Montserrat font, sidebar Pro badges, item counts, colored collection circles, pinned collection item icons with +N overflow badge
