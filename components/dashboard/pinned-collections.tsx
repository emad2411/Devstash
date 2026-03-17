'use client';

import { Collection, ItemType } from '@/lib/data';
import { CollectionCard } from './collection-card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface PinnedCollectionsProps {
  collections: Collection[];
  itemTypes: ItemType[];
}

export function PinnedCollections({ collections, itemTypes }: PinnedCollectionsProps) {
  // Mock item counts for each collection
  const getItemCount = (index: number) => {
    const counts = [12, 8, 24, 15, 6];
    return counts[index % counts.length];
  };

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Pinned Collections</h2>
        <Button variant="ghost" size="sm" className="group gap-1 px-2">
          View all
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {collections.slice(0, 6).map((collection, index) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            itemTypes={itemTypes}
            itemCount={getItemCount(index)}
          />
        ))}
      </div>
    </section>
  );
}
