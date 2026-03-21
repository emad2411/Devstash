# Dashboard & Sidebar Improvements Implementation Plan

This plan addresses font updates, sidebar navigation tweaks, and collection badge enhancements across the application.

## 1. Font Update
- Import `Montserrat` in **[app/layout.tsx](file:///c:/Users/ramam/Desktop/devstash/app/layout.tsx)** replacing `Geist`. 
- Update **[app/globals.css](file:///c:/Users/ramam/Desktop/devstash/app/globals.css)** to map `--font-sans` to the Montserrat CSS variable.

## 2. Sidebar Updates
**File:** [components/layout/sidebar.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx) & [app/dashboard/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx)
- **Reordering:** In [app/dashboard/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx), sort `itemTypes` before passing them to the layout so that the "File" and "Image" types appear at the end.
- **Badges:** In [sidebar.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx)'s [NavItem](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#34-85) component:
  - Conditionally render a small "Pro" tag spanning if `item.id === 'file'` or `item.id === 'image'`.
  - Add the `itemCount` provided in [NavItemData](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#27-33) to the right side of the label (`item.itemCount`).
- **Sidebar Collections Icons:** In [CollectionItem](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#86-120), replace the `<Folder />` icon with a colored circle (`<div className="h-3 w-3 rounded-full" />`). The background color will use the collection's computed most common item type color. 

## 3. Pinned Collections Badges
**Files:** [lib/queries.ts](file:///c:/Users/ramam/Desktop/devstash/lib/queries.ts), [types/dashboard.ts](file:///c:/Users/ramam/Desktop/devstash/types/dashboard.ts), [components/dashboard/pinned-collections.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/pinned-collections.tsx), [components/dashboard/collection-card.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/collection-card.tsx)
- Refactor the [getPinnedCollections](file:///c:/Users/ramam/Desktop/devstash/lib/queries.ts#146-185) Prisma query in [lib/queries.ts](file:///c:/Users/ramam/Desktop/devstash/lib/queries.ts) to fetch the top 3 items inside each collection (`items: { take: 3, select: { itemType: true } }`).
- Adjust [DashboardCollection](file:///c:/Users/ramam/Desktop/devstash/types/dashboard.ts#22-35) type to include these `topItems` (or generic `items`).
- In [collection-card.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/collection-card.tsx), map over the top 3 items and render their `icon` using `renderIcon`.
- Display a `+N` badge next to the icons inside the card when `collection.itemCount > 3` (where `N = collection.itemCount - 3`).

## 4. Most Common Item Type Resolution
- For the sidebar collections to show the most common item type color, we will update [getCollections](file:///c:/Users/ramam/Desktop/devstash/lib/queries.ts#57-93) in [lib/queries.ts](file:///c:/Users/ramam/Desktop/devstash/lib/queries.ts) to compute the most frequent item type per collection. Since Prisma's `groupBy` combined with relational data can be tricky in a single query, we'll fetch the aggregated item type counts for the user's collections and attach the most frequent `color` and `icon` to the returned `collections` array mapping.

## Verification Plan

### Automated Tests
This project does not currently have testing configured.

### Manual Verification
1. Start the development server (`npm run dev`).
2. Verify the font family globally applied is Montserrat.
3. Open the sidebar and check that "File" and "Image" are sorted to the bottom of the "All Items" list.
4. Verify the "Pro" badge appears next to "File" and "Image" in the sidebar.
5. Verify counters showing the amount of items appear next to each sidebar navigation item.
6. Verify sidebar collections now have a colored circle matching their most common item type instead of a folder icon.
7. Under "Pinned Collections" on the main dashboard area, confirm that up to 3 icons render for items in those collections, with a "+X" showing if there are more than 3 items.
