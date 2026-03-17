'use client';

import {
  ChevronRight,
  Code2,
  Command,
  FileImage,
  FileText,
  Folder,
  Grid3X3,
  ImageIcon,
  Link as LinkIcon,
  Settings,
  Sparkles,
  StickyNote,
  Terminal,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeItem: string;
  onItemClick: (item: string) => void;
}

// Navigation items with their colors from project spec
const navItems = [
  { id: 'all', label: 'All Items', icon: Grid3X3, color: '#6b7280' },
  { id: 'snippet', label: 'Snippets', icon: Code2, color: '#3b82f6' },
  { id: 'prompt', label: 'Prompts', icon: Sparkles, color: '#8b5cf6' },
  { id: 'command', label: 'Commands', icon: Terminal, color: '#f97316' },
  { id: 'note', label: 'Notes', icon: StickyNote, color: '#fde047' },
  { id: 'image', label: 'Images', icon: ImageIcon, color: '#ec4899' },
  { id: 'file', label: 'Files', icon: FileText, color: '#6b7280' },
  { id: 'link', label: 'Links', icon: LinkIcon, color: '#10b981' },
];

// Mock collections data
const collections = [
  { id: '1', name: 'React Patterns', count: 12 },
  { id: '2', name: 'Docker Configs', count: 5 },
  { id: '3', name: 'API Prompts', count: 8 },
  { id: '4', name: 'Useful Tools', count: 24 },
  { id: '5', name: 'Design Assets', count: 15 },
];

function NavItem({
  item,
  isActive,
  isOpen,
  onClick,
}: {
  item: (typeof navItems)[0];
  isActive: boolean;
  isOpen: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  const content = (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
      )}
    >
      {/* Active indicator for collapsed state */}
      {!isOpen && isActive && (
        <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
      )}

      <Icon
        className="shrink-0 transition-colors"
        style={{ color: item.color }}
        size={20}
      />

      {isOpen && (
        <span className="truncate text-sm font-medium">{item.label}</span>
      )}
    </button>
  );

  if (!isOpen) {
    return (
      <Tooltip>
        <TooltipTrigger render={content} />
        <TooltipContent side="right" className="ml-2">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function CollectionItem({
  collection,
  isOpen,
}: {
  collection: (typeof collections)[0];
  isOpen: boolean;
}) {
  const content = (
    <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
      <Folder className="shrink-0" size={18} />
      {isOpen && (
        <>
          <span className="flex-1 truncate text-sm">{collection.name}</span>
          <span className="text-xs text-muted-foreground">
            {collection.count}
          </span>
        </>
      )}
    </button>
  );

  if (!isOpen) {
    return (
      <Tooltip>
        <TooltipTrigger render={content} />
        <TooltipContent side="right" className="ml-2">
          {collection.name} ({collection.count})
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function Sidebar({
  isOpen,
  onToggle,
  activeItem,
  onItemClick,
}: SidebarProps) {
  return (
    <TooltipProvider>
      <aside
        className={cn(
          'flex h-full flex-col border-r border-border/50 bg-background transition-all duration-300 ease-in-out',
          isOpen ? 'w-[260px]' : 'w-[70px]'
        )}
      >
        {/* TOP SECTION: Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                isOpen={isOpen}
                onClick={() => onItemClick(item.id)}
              />
            ))}
          </nav>

          {/* MIDDLE SECTION: Collections */}
          {isOpen && (
            <div className="mt-6 px-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Collections
                </h3>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-0.5">
                {collections.map((collection) => (
                  <CollectionItem
                    key={collection.id}
                    collection={collection}
                    isOpen={isOpen}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Collapsed collections indicator */}
          {!isOpen && (
            <div className="mt-6 flex flex-col items-center gap-2 px-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground">
                      <Folder size={18} />
                    </button>
                  }
                />
                <TooltipContent side="right" className="ml-2">
                  Collections ({collections.length})
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: User Profile */}
        <div
          className={cn(
            'border-t border-border/50 py-4',
            isOpen ? 'px-4' : 'px-2'
          )}
        >
          {isOpen ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">John Doe</span>
                <span className="text-xs text-blue-500">Pro Plan</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                        JD
                      </AvatarFallback>
                    </Avatar>
                  }
                />
                <TooltipContent side="right" className="ml-2">
                  John Doe - Pro Plan
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  }
                />
                <TooltipContent side="right" className="ml-2">
                  Settings
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
