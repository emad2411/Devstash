'use client';

import { DashboardCollection } from '@/types/dashboard';
import { renderIcon } from '@/lib/icon-map';

interface CollectionCardProps {
  collection: DashboardCollection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  // Get the default type color for the left border accent
  const accentColor = collection.defaultType?.color || '#6b7280';

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderLeftWidth: '4px', borderLeftColor: accentColor }}
    >
      {/* Top row: type icon */}
      <div className="mb-3 flex gap-1.5">
        {collection.defaultType && (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor
            }}
          >
            {renderIcon(collection.defaultType.icon, { className: 'h-3.5 w-3.5' })}
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
