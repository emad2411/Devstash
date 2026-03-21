/** Lightweight collection shape for sidebar display */
export interface SidebarCollection {
  id: string;
  name: string;
  count: number;
  color: string;
}

/** Item type navigation entry for sidebar */
export interface SidebarNavItem {
  id: string;
  name: string;
  icon: string;   // Lucide icon name as string
  color: string;
  itemCount: number;
}

/** Dashboard statistics */
export interface DashboardStats {
  totalItems: number;
  favorites: number;
  pinned: number;
}
