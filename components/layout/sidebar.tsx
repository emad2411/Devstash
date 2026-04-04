'use client';

import { ChevronRight, Folder, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { logoutAction } from '@/actions/auth';
import { renderIcon } from '@/lib/icon-map';
import { cn, getInitials } from '@/lib/utils';
import { SidebarCollection, SidebarNavItem } from '@/types/layout';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeItem: string;
  onItemClick: (item: string) => void;
  collections: SidebarCollection[];
  navItems: SidebarNavItem[];
  user?: { id: string; name?: string | null; email?: string | null; image?: string | null; isPro?: boolean | null };
}


interface NavItemData {
  id: string;
  label: string;
  icon: string;
  color: string;
  itemCount: number;
}

function NavItem({
  item,
  isActive,
  isOpen,
  onClick,
}: {
  item: NavItemData;
  isActive: boolean;
  isOpen: boolean;
  onClick: () => void;
}) {
  const isPro = item.label.toLowerCase() === 'file' || item.label.toLowerCase() === 'image';

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

      {renderIcon(item.icon, {
        className: 'shrink-0 transition-colors',
        style: { color: item.color },
        size: 20,
      })}

      {isOpen && (
        <div className="flex flex-1 items-center justify-between overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{item.label}</span>
            {isPro && (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
                Pro
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {item.itemCount}
          </span>
        </div>
      )}
    </button>
  );

  if (!isOpen) {
    return (
      <Tooltip>
        <TooltipTrigger render={content} />
        <TooltipContent side="right" className="ml-2">
          <div className="flex items-center gap-2">
            <span>{item.label}</span>
            {isPro && (
              <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[10px] font-semibold text-amber-400">
                Pro
              </span>
            )}
          </div>
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
  collection: SidebarCollection;
  isOpen: boolean;
}) {
  const content = (
    <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
      <div
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: collection.color }}
      />
      {isOpen && (
        <>
          <span className="flex-1 truncate text-sm text-left">{collection.name}</span>
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
  activeItem,
  onItemClick,
  collections,
  navItems,
  user,
}: SidebarProps) {
  // "All Items" is prepended as a static entry
  const totalCount = navItems.reduce((sum, item) => sum + item.itemCount, 0);
  const allNavItems: NavItemData[] = [
    { id: 'all', label: 'All Items', icon: 'Grid3X3', color: '#6b7280', itemCount: totalCount },
    ...navItems.map((item) => ({
      id: item.id,
      label: item.name,
      icon: item.icon,
      color: item.color,
      itemCount: item.itemCount,
    })),
  ];
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
            {allNavItems.map((item) => (
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
            <DropdownMenu>
              <div className="flex items-center gap-3">
                <DropdownMenuTrigger
                  render={
                    <button className="relative flex h-9 w-9 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <Avatar className="h-9 w-9">
                        {user?.image ? (
                          <AvatarImage src={user.image} alt={user.name ?? user.email ?? 'User avatar'} />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {getInitials(user?.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </button>
                  }
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{user?.name ?? user?.email ?? 'Developer'}</span>
                  <span className="text-xs text-blue-500">{user?.isPro ? 'Pro Plan' : 'Free Plan'}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem
                  className="cursor-pointer"
                  render={<Link href="/profile" />}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={() => logoutAction()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <DropdownMenuTrigger
                        render={
                          <button className="relative flex h-8 w-8 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
                            <Avatar className="h-8 w-8">
                              {user?.image ? (
                                <AvatarImage src={user.image} alt={user.name ?? user.email ?? 'User avatar'} />
                              ) : (
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                                  {getInitials(user?.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </button>
                        }
                      />
                    }
                  />
                  <TooltipContent side="right" className="ml-2">
                    {user?.name ?? user?.email ?? 'Developer'} - {user?.isPro ? 'Pro Plan' : 'Free Plan'}
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    render={<Link href="/profile" />}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-500 focus:text-red-500"
                    onClick={() => logoutAction()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
