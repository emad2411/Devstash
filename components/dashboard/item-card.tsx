'use client';

import { useState, useEffect } from 'react';
import { Item, ItemType } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
  Pin,
  Star
} from 'lucide-react';

interface ItemCardProps {
  item: Item;
  itemType: ItemType | undefined;
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

const typeLabels: Record<string, string> = {
  snippet: 'Snippet',
  prompt: 'Prompt',
  command: 'Command',
  note: 'Note',
  file: 'File',
  image: 'Image',
  link: 'Link',
};

function useRelativeTime(date: Date): string {
  const [relativeTime, setRelativeTime] = useState<string>(() => {
    // Initial static format for server/client consistency
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  });

  useEffect(() => {
    // Calculate relative time on client only
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      setRelativeTime(`${minutes} minute${minutes !== 1 ? 's' : ''} ago`);
    } else if (hours < 24) {
      setRelativeTime(`${hours} hour${hours !== 1 ? 's' : ''} ago`);
    } else if (days < 7) {
      setRelativeTime(`${days} day${days !== 1 ? 's' : ''} ago`);
    } else {
      setRelativeTime(new Date(date).toLocaleDateString());
    }
  }, [date]);

  return relativeTime;
}

export function ItemCard({ item, itemType }: ItemCardProps) {
  const Icon = itemType ? iconMap[itemType.icon] || File : File;
  const typeColor = itemType?.color || '#6b7280';
  const typeName = itemType?.name || 'file';
  const relativeTime = useRelativeTime(item.updatedAt);

  // Mock tags for display - deterministic based on item id
  const tagOptions = ['react', 'hooks', 'ai', 'bash'];
  const tagCount = (item.id.charCodeAt(item.id.length - 1) % 3) + 1;
  const mockTags = tagOptions.slice(0, tagCount);

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
            <Icon className="h-4 w-4" />
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
          {typeLabels[typeName] || typeName}
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
        {mockTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
