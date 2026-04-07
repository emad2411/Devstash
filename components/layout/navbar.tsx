'use client';

import { useState } from 'react';
import {
  Bell,
  Code2,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ItemForm } from '@/components/items/item-form';

interface NavbarProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Navbar({ onSidebarToggle, isSidebarOpen = false }: NavbarProps) {
  const [isDark, setIsDark] = useState(false);
  const [notificationCount] = useState(3);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Theme toggle logic would go here
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-border/50 bg-background/95 backdrop-blur">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left side: Sidebar toggle + Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="shrink-0"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>

          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Code2 className="size-5 text-white" />
            </div>
            <span className="text-lg font-semibold">DevStash</span>
          </div>
        </div>

        {/* Center: Global search bar */}
        <div className="mx-4 hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search snippets, prompts, notes... (Press '/')"
              className="h-10 w-full border bg-muted/50 pl-10 pr-16 text-sm"
            />
            <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground md:block">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="shrink-0"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative shrink-0"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {notificationCount > 0 && (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                {notificationCount}
              </span>
            )}
          </Button>

          {/* New Collection button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-1.5 sm:flex"
          >
            <Plus className="size-4" />
            <span>New Collection</span>
          </Button>

          {/* New Item button */}
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setIsItemFormOpen(true)}
          >
            <Plus className="size-4" />
            <span>New Item</span>
          </Button>
        </div>
      </div>

      {/* Item Creation Modal */}
      <ItemForm open={isItemFormOpen} onOpenChange={setIsItemFormOpen} />
    </header>
  );
}
