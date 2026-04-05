# Build Item Listing by Type Page (`/items/[type]`)

This plan covers Phase 2, Step 2: implementing dynamic item listing by type (e.g. `/items/snippets`, `/items/prompts`).

## User Review Required

> [!NOTE]
> Please review the proposed query design and route structure. We will be leveraging the existing generic `ItemCard` to maintain UI consistency!

## Proposed Changes

### Database Query Layer

#### [MODIFY] [lib/queries.ts](file:///c:/Users/ramam/Desktop/devstash/lib/queries.ts)
- Add a new helper function `getItemsByType(userId: string, typeName: string)`.
- It will query Prisma `item` where `userId` matches and `itemType.name` equals `typeName`.
- Include tags and itemType data in the returned payload.

---

### UI Components

#### [NEW] [components/items/items-grid.tsx](file:///c:/Users/ramam/Desktop/devstash/components/items/items-grid.tsx)
- Create a `ItemsGrid` client component that handles the layout logic (Grid vs. List view toggling), similar to `RecentItems`.
- Render the existing `@/components/dashboard/item-card` for individual items.

---

### App Router Architecture

#### [NEW] [app/dashboard/items/[type]/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/items/[type]/page.tsx)
- Server Component that verifies user authentication.
- Maps the dynamic `[type]` string parameter from the URL to the DB query.
- Fetches the appropriate items.
- Displays the `ItemsGrid` if items are found.
- Renders an empty state placeholder if no items match the type.

#### [NEW] [app/dashboard/items/[type]/loading.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/items/[type]/loading.tsx)
- Display `shadcn/ui` based loading skeletons matching the item card grid so the user experience feels snappy during server roundtrips.

## Open Questions

> [!TIP]
> Are you happy with implementing a grid/list toggle (like the one on the dashboard) for this page, or should it purely be a grid view for now? 

## Verification Plan

### Automated Tests
- TypeScript check with `npm run tsc` or Next.js build.
- Linter verification.

### Manual Verification
- In the development server, navigate to `/dashboard/items/snippet` and `/dashboard/items/prompt`.
- Verify the retrieved items correctly match their route segments.
- Validate empty state renders correctly for unused types like `/dashboard/items/file`.
- Verify skeleton loading displays appropriately on soft navigations.
