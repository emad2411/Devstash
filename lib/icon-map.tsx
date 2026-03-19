import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
  Folder,
  Grid3X3,
  Star,
  Pin,
  Settings,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Menu,
  ChevronRight,
  ExternalLink,
  Copy,
  Download,
  Upload,
  Bot,
  LayoutGrid,
  List,
  Filter,
  MoreVertical,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
  Folder,
  Grid3X3,
  Star,
  Pin,
  Settings,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Menu,
  ChevronRight,
  ExternalLink,
  Copy,
  Download,
  Upload,
  Bot,
  LayoutGrid,
  List,
  Filter,
  MoreVertical,
  Heart,
};

/** Resolve a Lucide icon name string to its component. Falls back to File. */
export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? File;
}

/** Render an icon element from a name string. Use this in components to avoid creating components during render. */
export function renderIcon(name: string, props: React.ComponentProps<LucideIcon>): React.ReactElement {
  const Icon = iconMap[name] ?? File;
  return <Icon {...props} />;
}
