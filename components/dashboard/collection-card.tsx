'use client';

import { DashboardCollection } from '@/types/dashboard';
import { renderIcon } from '@/lib/icon-map';

interface CollectionCardProps {
  collection: DashboardCollection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  // Get the default type color for the left border accent
  const accentColor = collection.defaultType?.color || '#6b7280';

  // Calculate overflow count
  const overflowCount = collection.itemCount > 3 ? collection.itemCount - 3 : 0;

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderLeftWidth: '4px', borderLeftColor: accentColor }}
    >
      {/* Top row: item type icons */}
      <div className="mb-3 flex items-center gap-1.5">
        {collection.topItems.map((item, index) => (
          <div
            key={index}
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{
              backgroundColor: `${item.color}20`,
              color: item.color
            }}
          >
            {renderIcon(item.icon, { className: 'h-3.5 w-3.5' })}
          </div>
        ))}
        {overflowCount > 0 && (
          <div className="flex h-7 items-center justify-center rounded-md bg-muted px-2 text-xs font-medium text-muted-foreground">
            +{overflowCount}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
        {collection.name}
      </h3>

      {/* Item count */}
      <p className="mt-1 text-sm text-muted-foreground">
        {collection.itemCount} items
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
