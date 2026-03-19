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
