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
  const [itemTypesRaw, collections, recentItems, pinnedCollections, stats] =
    await Promise.all([
      getItemTypes(user.id),
      getCollections(user.id),
      getRecentItems(user.id),
      getPinnedCollections(user.id),
      getDashboardStats(user.id),
    ]);

  // Sort itemTypes so "File" and "Image" appear at the end (Pro features)
  const itemTypes = [...itemTypesRaw].sort((a, b) => {
    const isAPro = a.name.toLowerCase() === 'file' || a.name.toLowerCase() === 'image';
    const isBPro = b.name.toLowerCase() === 'file' || b.name.toLowerCase() === 'image';
    if (isAPro && !isBPro) return 1;
    if (!isAPro && isBPro) return -1;
    return a.name.localeCompare(b.name);
  });

  // Transform collections for sidebar
  const sidebarCollections: SidebarCollection[] = collections.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.itemCount,
    color: c.mostCommonColor,
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
