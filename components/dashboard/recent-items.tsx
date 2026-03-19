'use client';

import { useState } from 'react';
import { DashboardItem } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

import { ItemCard } from './item-card';

interface RecentItemsProps {
  items: DashboardItem[];
}

type ViewMode = 'grid' | 'list';

export function RecentItems({ items }: RecentItemsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Server already returns sorted items, just take first 8
  const recentItems = items.slice(0, 8);

  return (
    <section>
      {/* Header with view toggle */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Items</h2>
        <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-md',
              viewMode === 'grid' && 'bg-card text-foreground shadow-sm'
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-md',
              viewMode === 'list' && 'bg-card text-foreground shadow-sm'
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Items grid/list */}
      <div className={cn(
        'grid gap-4',
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
      )}>
        {recentItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}
