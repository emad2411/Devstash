# DashboardLayout Component Extraction

Extract Navbar + Sidebar + main content shell from [app/dashboard/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx) into a reusable `DashboardLayout` component. The page will remain a **Server Component** (data-fetching boundary), while `DashboardLayout` will be a **Client Component** (owns sidebar-open state). Main content is passed as `children`.

## User Review Required

> [!IMPORTANT]
> **Breaking change to data flow** – The Sidebar currently has **hardcoded mock collections** (lines 49-55 of [sidebar.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx)). This plan removes them and makes [Sidebar](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#146-273) accept `collections` as a prop so data flows top-down from `page.tsx → DashboardLayout → Sidebar`. Please confirm this is the desired direction.

> [!IMPORTANT]
> **[app/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/page.tsx) vs [app/dashboard/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx)** – The current dashboard lives at [app/dashboard/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx). Your request mentions [app/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/page.tsx) (currently an empty stub). This plan assumes the work is on [app/dashboard/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx) which is the actual dashboard page. Please confirm.

## Current Architecture

```
app/dashboard/page.tsx ('use client')
├── useState (isSidebarOpen, activeItem)
├── <Navbar />          ← receives toggle callback + state
├── <Sidebar />         ← receives state + callbacks; hardcoded collections
└── <main>
    ├── <WelcomeHeader />
    ├── <PinnedCollections />
    └── <RecentItems />
```

**Problems:**
1. Page is `'use client'` — prevents server-side data fetching.
2. Layout (sidebar/navbar) is tightly coupled to page content.
3. Sidebar owns its own mock collection data instead of receiving it via props.

## Proposed Architecture

```
app/dashboard/page.tsx (Server Component — fetches data)
└── <DashboardLayout collections={…} navItems={…}>   ('use client')
    ├── <Navbar />          ← toggle callback + state
    ├── <Sidebar />         ← collections prop + state
    └── <main>{children}</main>
        ├── <WelcomeHeader />
        ├── <PinnedCollections />
        └── <RecentItems />
```

**Benefits:**
- [page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/page.tsx) becomes a Server Component → ready for real Prisma data fetching.
- Layout concerns (sidebar toggle, active nav) are isolated in one Client Component.
- Main content flows in via `children` — any page can reuse the layout.
- Collections flow top-down from server → client; no hardcoded data in Sidebar.

---

## Proposed Changes

### Layout Components

#### [NEW] [dashboard-layout.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/dashboard-layout.tsx)

New `'use client'` component containing:
- `useState` for `isSidebarOpen` and `activeItem`
- Renders `<Navbar>`, `<Sidebar>`, and `<main>{children}</main>`
- Accepts props:

```ts
interface SidebarCollection {
  id: string;
  name: string;
  count: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  collections: SidebarCollection[];
}
```

---

#### [MODIFY] [sidebar.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx)

- Remove hardcoded `collections` array (lines 48-55).
- Add `collections` to [SidebarProps](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#29-35) interface.
- [CollectionItem](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#111-145) now uses the prop-supplied collection type.

```diff
 interface SidebarProps {
   isOpen: boolean;
   onToggle: () => void;
   activeItem: string;
   onItemClick: (item: string) => void;
+  collections: SidebarCollection[];
 }

-const collections = [
-  { id: '1', name: 'React Patterns', count: 12 },
-  ...
-];
```

---

### Dashboard Page

#### [MODIFY] [page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx)

- Remove `'use client'` directive → becomes a Server Component.
- Remove `useState` hooks (moved into `DashboardLayout`).
- Import `DashboardLayout` and wrap dashboard content as children.
- Pass `collections` data as props to `DashboardLayout`.

```tsx
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { PinnedCollections } from '@/components/dashboard/pinned-collections';
import { RecentItems } from '@/components/dashboard/recent-items';
import { mockCollections, mockItems, mockItemTypes } from '@/lib/data';

// Transform mockCollections into sidebar-friendly shape
const sidebarCollections = mockCollections.map((c, i) => ({
  id: c.id,
  name: c.name,
  count: [12, 8, 24, 15, 6][i % 5],
}));

export default function DashboardPage() {
  return (
    <DashboardLayout collections={sidebarCollections}>
      <div className="mx-auto max-w-7xl">
        <WelcomeHeader userName="John" />
        <PinnedCollections collections={mockCollections} itemTypes={mockItemTypes} />
        <RecentItems items={mockItems} itemTypes={mockItemTypes} />
      </div>
    </DashboardLayout>
  );
}
```

---

### Types (Optional Enhancement)

#### [NEW] [layout.ts](file:///c:/Users/ramam/Desktop/devstash/types/layout.ts)

Shared type for sidebar collections used by `DashboardLayout` and [Sidebar](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#146-273):

```ts
/** Lightweight collection shape for sidebar display */
export interface SidebarCollection {
  id: string;
  name: string;
  count: number;
}
```

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `components/layout/dashboard-layout.tsx` | **NEW** | Client Component with sidebar state + Navbar + Sidebar + children |
| [components/layout/sidebar.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx) | **MODIFY** | Accept `collections` via props, remove hardcoded data |
| [app/dashboard/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx) | **MODIFY** | Convert to Server Component, use `DashboardLayout` |
| `types/layout.ts` | **NEW** | Shared `SidebarCollection` interface |

## Verification Plan

### Build verification
```bash
npm run build
```
Build must pass with zero errors — confirms Server/Client Component boundaries are correct.

### Lint verification
```bash
npm run lint
```
Must pass with no new warnings.

### Manual Verification
After running `npm run dev` and navigating to `/dashboard`:

1. **Layout renders** — Navbar at top, Sidebar on left, main content on right.
2. **Sidebar toggle** — Click hamburger menu: sidebar collapses/expands smoothly.
3. **Collections in sidebar** — 5 collections visible (same names as `mockCollections`).
4. **Nav items** — Clicking a nav item highlights it (All Items, Snippets, etc.).
5. **Main content** — Welcome header, Pinned Collections grid, and Recent Items grid/list toggle all render and function.
6. **Responsive** — Resize window; layout adapts, search bar hides on small screens.
