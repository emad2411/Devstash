import { connection } from "next/server";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PinnedCollections } from "@/components/dashboard/pinned-collections";
import { RecentItems } from "@/components/dashboard/recent-items";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import {
  getCollections,
  getDashboardStats,
  getDemoUser,
  getItemTypes,
  getPinnedCollections,
  getRecentItems,
} from "@/lib/queries";
import { SidebarCollection } from "@/types/layout";

export default async function DashboardPage() {
  await connection(); // Next.js 16: opt into dynamic rendering

  const user = await getDemoUser();
  const [itemTypes, collections, recentItems, pinnedCollections, stats] =
    await Promise.all([
      getItemTypes(user.id),
      getCollections(user.id),
      getRecentItems(user.id),
      getPinnedCollections(user.id),
      getDashboardStats(user.id),
    ]);

  // Transform collections for sidebar
  const sidebarCollections: SidebarCollection[] = collections.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.itemCount,
  }));

  return (
    <DashboardLayout
      collections={sidebarCollections}
      navItems={itemTypes}
    >
      <div className="mx-auto max-w-7xl">
        <WelcomeHeader
          userName={user.name ?? "Developer"}
          totalItems={stats.totalItems}
        />
        <PinnedCollections collections={pinnedCollections} />
        <RecentItems items={recentItems} />
      </div>
    </DashboardLayout>
  );
}
