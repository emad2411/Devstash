import "server-only";
import { prisma } from "@/lib/prisma";

/** Temporary: fetch the seeded demo user. Replace with session auth later. */
export async function getDemoUser() {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    throw new Error("Demo user not found. Please run database seeding.");
  }

  return user;
}

/** Fetch all item types visible to the user (system + user-created) */
export async function getItemTypes(userId: string) {
  const itemTypes = await prisma.itemType.findMany({
    where: {
      OR: [
        { isSystem: true },
        { userId },
      ],
    },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      _count: {
        select: {
          items: {
            where: { userId },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return itemTypes.map((type) => ({
    id: type.id,
    name: type.name,
    icon: type.icon,
    color: type.color,
    itemCount: type._count.items,
  }));
}

/** Fetch user's collections with item counts */
export async function getCollections(userId: string) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      defaultTypeId: true,
      _count: {
        select: {
          items: true,
        },
      },
      defaultType: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    defaultTypeId: collection.defaultTypeId,
    itemCount: collection._count.items,
    defaultType: collection.defaultType,
  }));
}

/** Fetch recent items with their itemType included */
export async function getRecentItems(userId: string, limit = 8) {
  const items = await prisma.item.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      url: true,
      isFavorite: true,
      isPinned: true,
      language: true,
      itemTypeId: true,
      updatedAt: true,
      tags: {
        select: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
      itemType: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    language: item.language,
    itemTypeId: item.itemTypeId,
    updatedAt: item.updatedAt.toISOString(),
    tags: item.tags.map((t) => ({ name: t.tag.name })),
    itemType: item.itemType,
  }));
}

/** Fetch favorite/pinned collections with item counts */
export async function getPinnedCollections(userId: string) {
  const collections = await prisma.collection.findMany({
    where: {
      userId,
      isFavorite: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      defaultTypeId: true,
      _count: {
        select: {
          items: true,
        },
      },
      defaultType: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    defaultTypeId: collection.defaultTypeId,
    itemCount: collection._count.items,
    defaultType: collection.defaultType,
  }));
}

/** Fetch dashboard stats (total items, by type, favorites, pinned) */
export async function getDashboardStats(userId: string) {
  const [totalItems, favorites, pinned] = await Promise.all([
    prisma.item.count({
      where: { userId },
    }),
    prisma.item.count({
      where: { userId, isFavorite: true },
    }),
    prisma.item.count({
      where: { userId, isPinned: true },
    }),
  ]);

  return {
    totalItems,
    favorites,
    pinned,
  };
}
