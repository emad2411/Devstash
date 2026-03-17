'use client';

import { Collection, ItemType } from '@/lib/data';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
  Folder
} from 'lucide-react';

interface CollectionCardProps {
  collection: Collection;
  itemTypes: ItemType[];
  itemCount: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

export function CollectionCard({ collection, itemTypes, itemCount }: CollectionCardProps) {
  // Get the default type color for the left border accent
  const defaultType = itemTypes.find(t => t.id === collection.defaultTypeId);
  const accentColor = defaultType?.color || '#6b7280';

  // Get a few item types to show as icons (mock representation)
  const displayTypes = itemTypes.slice(0, 4);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderLeftWidth: '4px', borderLeftColor: accentColor }}
    >
      {/* Top row of type icons */}
      <div className="mb-3 flex gap-1.5">
        {displayTypes.map((type, index) => {
          const Icon = iconMap[type.icon] || Folder;
          return (
            <div
              key={type.id}
              className="flex h-7 w-7 items-center justify-center rounded-md"
              style={{
                backgroundColor: `${type.color}20`,
                color: type.color
              }}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
          );
        })}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
        {collection.name}
      </h3>

      {/* Item count */}
      <p className="mt-1 text-sm text-muted-foreground">
        {itemCount} items
      </p>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 50%)`
        }}
      />
    </div>
  );
}
