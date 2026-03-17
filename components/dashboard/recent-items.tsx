'use client';

import { useState } from 'react';
import { Item, ItemType } from '@/lib/data';
import { ItemCard } from './item-card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentItemsProps {
  items: Item[];
  itemTypes: ItemType[];
}

type ViewMode = 'grid' | 'list';

export function RecentItems({ items, itemTypes }: RecentItemsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Get item type for an item
  const getItemType = (item: Item) => {
    return itemTypes.find(t => t.id === item.itemTypeId);
  };

  // Sort by updatedAt descending and take first 8
  const recentItems = [...items]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

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
            itemType={getItemType(item)}
          />
        ))}
      </div>
    </section>
  );
}
