/** Serializable item for Client Components */
export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  itemTypeId: string;
  updatedAt: string;       // ISO string (serialized for client)
  tags: { name: string }[];
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
}

/** Serializable item type for collection display */
interface CollectionItemType {
  icon: string;
  color: string;
}

/** Serializable collection for dashboard display */
export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  defaultTypeId: string | null;
  itemCount: number;
  defaultType: {
    name: string;
    icon: string;
    color: string;
  } | null;
  topItems: CollectionItemType[];
}
