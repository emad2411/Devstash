'use client';

import { useState } from 'react';

import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { PinnedCollections } from '@/components/dashboard/pinned-collections';
import { RecentItems } from '@/components/dashboard/recent-items';
import { mockCollections, mockItems, mockItemTypes } from '@/lib/data';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('all');

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
          onItemClick={setActiveItem}
        />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="mx-auto max-w-7xl">
            {/* Section 1: Welcome Header */}
            <WelcomeHeader userName="John" />

            {/* Section 2: Pinned Collections */}
            <PinnedCollections
              collections={mockCollections}
              itemTypes={mockItemTypes}
            />

            {/* Section 3: Recent Items */}
            <RecentItems
              items={mockItems}
              itemTypes={mockItemTypes}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
