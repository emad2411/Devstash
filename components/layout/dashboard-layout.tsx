'use client';

import { useState } from 'react';

import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { SidebarCollection } from '@/types/layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
  collections: SidebarCollection[];
}

export function DashboardLayout({ children, collections }: DashboardLayoutProps) {
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
          collections={collections}
        />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
