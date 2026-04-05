'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { SidebarCollection, SidebarNavItem } from '@/types/layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
  collections: SidebarCollection[];
  navItems: SidebarNavItem[];
  user?: { id: string; name?: string | null; email?: string | null; image?: string | null; isPro?: boolean | null };
}

export function DashboardLayout({ children, collections, navItems, user }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Determine active item based on current pathname
  const getActiveItem = () => {
    if (pathname === '/dashboard') {
      return 'all';
    }
    // Match /dashboard/items/[type] pattern
    const match = pathname.match(/\/dashboard\/items\/([^/]+)/);
    if (match) {
      const typeName = match[1].toLowerCase();
      // Find the nav item with matching name
      const navItem = navItems.find((item) => item.name.toLowerCase() === typeName);
      return navItem?.id ?? 'all';
    }
    return 'all';
  };

  const activeItem = getActiveItem();

  return (
    <div className="flex h-screen flex-col">
      <Navbar
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeItem={activeItem}
          onItemClick={() => {}}
          collections={collections}
          navItems={navItems}
          user={user}
        />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
