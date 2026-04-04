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

/** Fetch user's collections with item counts and most common item type color */
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
      items: {
        select: {
          item: {
            select: {
              itemType: {
                select: {
                  color: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return collections.map((collection) => {
    // Compute most common item type color
    const colorCounts = new Map<string, number>();
    collection.items.forEach((ic) => {
      const color = ic.item.itemType.color;
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    });

    let mostCommonColor = collection.defaultType?.color || '#6b7280';
    let maxCount = 0;
    colorCounts.forEach((count, color) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonColor = color;
      }
    });

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      defaultTypeId: collection.defaultTypeId,
      itemCount: collection._count.items,
      defaultType: collection.defaultType,
      mostCommonColor,
    };
  });
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

/** Fetch favorite/pinned collections with item counts and top 3 items */
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
      items: {
        take: 3,
        orderBy: { addedAt: "desc" },
        select: {
          item: {
            select: {
              itemType: {
                select: {
                  icon: true,
                  color: true,
                },
              },
            },
          },
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
    topItems: collection.items.map((ic) => ({
      icon: ic.item.itemType.icon,
      color: ic.item.itemType.color,
    })),
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

/** Fetch profile data (user info with hasPasswordAccount) */
export async function getProfileData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPro: true,
      createdAt: true,
      password: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    isPro: user.isPro,
    createdAt: user.createdAt,
    hasPasswordAccount: !!user.password,
    oauthProviders: user.accounts.map((a) => a.provider),
  };
}

/** Fetch profile stats (total items, collections, item type breakdown) */
export async function getProfileStats(userId: string) {
  const [totalItems, totalCollections, itemsByType] = await Promise.all([
    prisma.item.count({
      where: { userId },
    }),
    prisma.collection.count({
      where: { userId },
    }),
    prisma.item.groupBy({
      by: ["itemTypeId"],
      where: { userId },
      _count: {
        itemTypeId: true,
      },
    }),
  ]);

  // Get item type names for the breakdown
  const itemTypeIds = itemsByType.map((item) => item.itemTypeId);
  const itemTypes = await prisma.itemType.findMany({
    where: {
      id: { in: itemTypeIds },
    },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
    },
  });

  const itemTypeMap = new Map(itemTypes.map((t) => [t.id, t]));

  const itemTypeBreakdown = itemsByType.map((item) => ({
    ...itemTypeMap.get(item.itemTypeId)!,
    count: item._count.itemTypeId,
  }));

  return {
    totalItems,
    totalCollections,
    itemTypeBreakdown,
  };
}
