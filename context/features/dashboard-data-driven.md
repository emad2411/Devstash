# Database-Driven Dashboard & Sidebar

Replace all mock data in the dashboard and sidebar with real Prisma database queries. The page stays a Server Component that fetches all data top-down. ItemTypes (nav links) also come from DB since users can create custom types.

## User Review Required

> [!IMPORTANT]
> **No auth yet** — There is no `lib/auth.ts` or Next-Auth configuration. This plan uses a **temporary `getDemoUser()` helper** that fetches the seeded demo user by email (`demo@devstash.io`). This will be replaced with real session-based auth in a future feature. Confirm this approach.

> [!IMPORTANT]
> **Sidebar NavItem icons** — ItemTypes store icon names as strings (e.g. `"Code"`, `"Sparkles"`). The Sidebar currently maps hardcoded Lucide icon imports to each nav item. With DB-driven types, we need a **Lucide icon resolver** utility that maps icon name strings → React components at runtime. This is the approach used by [CollectionCard](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/collection-card.tsx#31-83) already (`iconMap`). Confirm this is acceptable for your design.

> [!IMPORTANT]
> **"All Items" entry** — The current sidebar has a synthetic "All Items" nav entry that isn't an ItemType in the DB. This plan keeps it as a **static entry prepended** to DB-fetched types. Confirm.

## Current State → Target State

```
CURRENT:                                    TARGET:
page.tsx (Server Component)                 page.tsx (Server Component)
├── imports mockCollections, mockItems...   ├── Prisma queries for real data
├── hardcodes sidebarCollections            ├── queries collections + _count
└── <DashboardLayout>                       └── <DashboardLayout>
    ├── Sidebar has hardcoded navItems          ├── Sidebar receives navItems from DB
    ├── mock collections in sidebar             ├── real collections with counts
    └── children use lib/data types             └── children use DB types (types/dashboard.ts)
```

---

## Proposed Changes

### Data Access Layer

#### [NEW] [queries.ts](file:///c:/Users/ramam/Desktop/devstash/lib/queries.ts)

Server-only module with Prisma queries for the dashboard. Uses `"server-only"` import guard.

```ts
import "server-only";
import { prisma } from "@/lib/prisma";

/** Temporary: fetch the seeded demo user. Replace with session auth later. */
export async function getDemoUser() { ... }

/** Fetch all item types visible to the user (system + user-created) */
export async function getItemTypes(userId: string) { ... }

/** Fetch user's collections with item counts */
export async function getCollections(userId: string) { ... }

/** Fetch recent items with their itemType included */
export async function getRecentItems(userId: string, limit = 8) { ... }

/** Fetch favorite/pinned collections with item counts */
export async function getPinnedCollections(userId: string) { ... }

/** Fetch dashboard stats (total items, by type, favorites, pinned) */
export async function getDashboardStats(userId: string) { ... }
```

Each query uses Prisma `select` to limit fields (per coding standards) and `_count` for collection item counts.

---

#### [NEW] [install server-only package]

```bash
npm install server-only
```

Ensures `lib/queries.ts` cannot be imported from Client Components.

---

### Types

#### [MODIFY] [layout.ts](file:///c:/Users/ramam/Desktop/devstash/types/layout.ts)

Add `SidebarNavItem` type for DB-driven navigation and `DashboardStats`:

```ts
/** Lightweight collection shape for sidebar display */
export interface SidebarCollection {
  id: string;
  name: string;
  count: number;
}

/** Item type navigation entry for sidebar */
export interface SidebarNavItem {
  id: string;
  name: string;
  icon: string;   // Lucide icon name as string
  color: string;
  itemCount: number;
}

/** Dashboard statistics */
export interface DashboardStats {
  totalItems: number;
  favorites: number;
  pinned: number;
}
```

---

#### [NEW] [dashboard.ts](file:///c:/Users/ramam/Desktop/devstash/types/dashboard.ts)

Serializable types for dashboard components (dates as strings for Server→Client boundary):

```ts
/** Serializable item for Client Components */
export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  itemTypeId: string;
  updatedAt: string;       // ISO string (serialized for client)
  tags: { name: string }[];
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
}

/** Serializable collection for dashboard display */
export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  defaultTypeId: string | null;
  itemCount: number;
  defaultType: {
    name: string;
    icon: string;
    color: string;
  } | null;
}
```

---

### Utilities

#### [NEW] [icon-map.ts](file:///c:/Users/ramam/Desktop/devstash/lib/icon-map.ts)

Centralized Lucide icon resolver. Currently duplicated in [CollectionCard](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/collection-card.tsx#31-83), [ItemCard](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/item-card.tsx#74-167), and [Sidebar](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#140-267):

```ts
import { Code, Sparkles, Terminal, StickyNote, File, Image, Link, Folder, Grid3X3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link, Folder, Grid3X3,
};

/** Resolve a Lucide icon name string to its component. Falls back to File. */
export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? File;
}
```

---

### Layout Components

#### [MODIFY] [dashboard-layout.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/dashboard-layout.tsx)

Add `navItems` prop to forward DB-driven item types to [Sidebar](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx#140-267):

```diff
 interface DashboardLayoutProps {
   children: React.ReactNode;
   collections: SidebarCollection[];
+  navItems: SidebarNavItem[];
 }

 // Pass navItems={navItems} to <Sidebar>
```

---

#### [MODIFY] [sidebar.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx)

- Remove hardcoded `navItems` array (lines 39-48).
- Accept `navItems: SidebarNavItem[]` via props.
- Prepend a static "All Items" entry.
- Use `getIcon()` from `lib/icon-map.ts` to resolve icon strings → components.
- Remove direct Lucide icon imports for nav items (keep only `Folder`, `Settings`, `ChevronRight`).

```diff
 interface SidebarProps {
   isOpen: boolean;
   onToggle: () => void;
   activeItem: string;
   onItemClick: (item: string) => void;
   collections: SidebarCollection[];
+  navItems: SidebarNavItem[];
 }

-const navItems = [
-  { id: 'all', label: 'All Items', icon: Grid3X3, color: '#6b7280' },
-  ...
-];
+// "All Items" is prepended inside the component
```

---

### Dashboard Page

#### [MODIFY] [page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx)

Replace all mock imports with Prisma queries:

```tsx
import { connection } from "next/server";
import { getDemoUser, getItemTypes, getCollections, getRecentItems, getPinnedCollections, getDashboardStats } from "@/lib/queries";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { PinnedCollections } from "@/components/dashboard/pinned-collections";
import { RecentItems } from "@/components/dashboard/recent-items";

export default async function DashboardPage() {
  await connection();  // Next.js 16: opt into dynamic rendering

  const user = await getDemoUser();
  const [itemTypes, collections, recentItems, pinnedCollections, stats] = await Promise.all([
    getItemTypes(user.id),
    getCollections(user.id),
    getRecentItems(user.id),
    getPinnedCollections(user.id),
    getDashboardStats(user.id),
  ]);

  return (
    <DashboardLayout collections={sidebarCollections} navItems={navItems}>
      <div className="mx-auto max-w-7xl">
        <WelcomeHeader userName={user.name ?? "Developer"} totalItems={stats.totalItems} />
        <PinnedCollections collections={pinnedCollections} />
        <RecentItems items={recentItems} />
      </div>
    </DashboardLayout>
  );
}
```

---

### Dashboard Components

#### [MODIFY] [welcome-header.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/welcome-header.tsx)

- Remove `import { mockStats } from '@/lib/data'`
- Accept `totalItems` as prop instead

---

#### [MODIFY] [pinned-collections.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/pinned-collections.tsx)

- Replace `import { Collection, ItemType } from '@/lib/data'` → use `DashboardCollection` from `types/dashboard.ts`
- Remove `itemTypes` prop (each collection now has embedded `defaultType`)
- Remove mock [getItemCount](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/pinned-collections.tsx#14-19) — use `collection.itemCount` from DB query

---

#### [MODIFY] [collection-card.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/collection-card.tsx)

- Use `DashboardCollection` type
- Use `getIcon()` from `lib/icon-map.ts` instead of local `iconMap`
- Get color from `collection.defaultType.color` directly

---

#### [MODIFY] [recent-items.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/recent-items.tsx)

- Replace `import { Item, ItemType } from '@/lib/data'` → use `DashboardItem` from `types/dashboard.ts`
- Remove `itemTypes` prop — each item now includes its `itemType` inline
- Remove client-side sort (server already returns sorted)

---

#### [MODIFY] [item-card.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/item-card.tsx)

- Use `DashboardItem` type
- Use `getIcon()` from `lib/icon-map.ts`
- Use `item.tags` from DB instead of mock `tagOptions`
- Use `item.itemType` instead of separate `itemType` prop
- Parse `item.updatedAt` from ISO string

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `lib/queries.ts` | **NEW** | Server-only Prisma queries for dashboard data |
| `lib/icon-map.ts` | **NEW** | Centralized Lucide icon string → component resolver |
| [types/layout.ts](file:///c:/Users/ramam/Desktop/devstash/types/layout.ts) | **MODIFY** | Add `SidebarNavItem`, `DashboardStats` |
| `types/dashboard.ts` | **NEW** | Serializable types for dashboard components |
| [components/layout/dashboard-layout.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/dashboard-layout.tsx) | **MODIFY** | Add `navItems` prop |
| [components/layout/sidebar.tsx](file:///c:/Users/ramam/Desktop/devstash/components/layout/sidebar.tsx) | **MODIFY** | Accept `navItems` prop, remove hardcoded array |
| [app/dashboard/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/dashboard/page.tsx) | **MODIFY** | Replace mock imports with Prisma queries |
| [components/dashboard/welcome-header.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/welcome-header.tsx) | **MODIFY** | Accept `totalItems` prop |
| [components/dashboard/pinned-collections.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/pinned-collections.tsx) | **MODIFY** | Use `DashboardCollection`, remove itemTypes prop |
| [components/dashboard/collection-card.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/collection-card.tsx) | **MODIFY** | Use `DashboardCollection`, use shared `getIcon()` |
| [components/dashboard/recent-items.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/recent-items.tsx) | **MODIFY** | Use `DashboardItem`, remove itemTypes prop |
| [components/dashboard/item-card.tsx](file:///c:/Users/ramam/Desktop/devstash/components/dashboard/item-card.tsx) | **MODIFY** | Use `DashboardItem`, real tags, shared `getIcon()` |

## Verification Plan

### Build Verification
```bash
npm run build
```
Must pass — confirms Server/Client boundary, Prisma query generation, and type safety.

### Lint Verification
```bash
npm run lint
```

### Manual Verification
After `npm run dev`, navigate to `/dashboard`:

1. **Sidebar nav items** — Should show 7 system types from DB (snippet, prompt, command, note, file, image, link) plus "All Items"
2. **Sidebar collections** — Should show 5 seeded collections with real item counts
3. **Welcome header** — Should display "Demo" (from `user.name`) and real total item count (15)
4. **Pinned collections** — Should show favorite collections with correct item counts and type colors
5. **Recent items** — Should show 8 most recently updated items with real tags, correct type icons/colors
6. **No mock data** — Confirm [lib/data.ts](file:///c:/Users/ramam/Desktop/devstash/lib/data.ts) is no longer imported by any dashboard/layout file
