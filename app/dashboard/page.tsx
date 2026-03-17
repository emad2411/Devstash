'use client';

import { useState } from 'react';

import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';

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
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Welcome to DevStash. Select an item type from the sidebar to view your content.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
