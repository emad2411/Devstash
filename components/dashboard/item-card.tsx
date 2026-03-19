'use client';

import { useMemo } from 'react';
import { DashboardItem } from '@/types/dashboard';
import { renderIcon } from '@/lib/icon-map';
import { Button } from '@/components/ui/button';
import { Pin, Star } from 'lucide-react';

interface ItemCardProps {
  item: DashboardItem;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

export function ItemCard({ item }: ItemCardProps) {
  const typeColor = item.itemType.color;
  const typeName = item.itemType.name;
  const relativeTime = useMemo(() => formatRelativeTime(item.updatedAt), [item.updatedAt]);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderLeftWidth: '4px', borderLeftColor: typeColor }}
    >
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {/* Type icon */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${typeColor}15`,
              color: typeColor
            }}
          >
            {renderIcon(item.itemType.icon, { className: 'h-4 w-4' })}
          </div>

          {/* Title */}
          <h3 className="truncate font-medium text-card-foreground group-hover:text-primary transition-colors">
            {item.title}
          </h3>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground"
          >
            <Pin
              className="h-4 w-4"
              fill={item.isPinned ? typeColor : 'none'}
              stroke={item.isPinned ? typeColor : 'currentColor'}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-yellow-400"
          >
            <Star
              className="h-4 w-4"
              fill={item.isFavorite ? 'currentColor' : 'none'}
            />
          </Button>
        </div>
      </div>

      {/* Meta row */}
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className="font-medium"
          style={{ color: typeColor }}
        >
          {typeName}
        </span>
        <span>•</span>
        <span>{relativeTime}</span>
      </div>

      {/* Description */}
      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
        {item.description || 'No description available'}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <span
            key={tag.name}
            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            #{tag.name}
          </span>
        ))}
      </div>
    </div>
  );
}
