import { connection } from "next/server";
import { PinnedCollections } from "@/components/dashboard/pinned-collections";
import { RecentItems } from "@/components/dashboard/recent-items";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import {
  getDashboardStats,
  getPinnedCollections,
  getRecentItems,
} from "@/lib/queries";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  await connection();
  const sessionUser = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPro: true,
    },
  });

  if (!user) {
    throw new Error('Authenticated user not found in database');
  }

  const [recentItems, pinnedCollections, stats] = await Promise.all([
    getRecentItems(user.id),
    getPinnedCollections(user.id),
    getDashboardStats(user.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <WelcomeHeader
        userName={user.name ?? "Developer"}
        totalItems={stats.totalItems}
      />
      <PinnedCollections collections={pinnedCollections} />
      <RecentItems items={recentItems} />
    </div>
  );
}
