import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ItemsGrid } from "@/components/items/items-grid";
import { getItemsByType, getItemTypes } from "@/lib/queries";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { capitalize } from "@/lib/utils";

interface ItemsByTypePageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsByTypePage({ params }: ItemsByTypePageProps) {
  await connection();
  const sessionUser = await requireAuth();
  const { type } = await params;

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error('Authenticated user not found in database');
  }

  // Fetch item types to validate the type exists
  const itemTypes = await getItemTypes(user.id);

  // Check if the type is valid
  const validType = itemTypes.find((t) => t.name.toLowerCase() === type.toLowerCase());

  if (!validType) {
    notFound();
  }

  // Fetch items for the specific type
  const items = await getItemsByType(user.id, type);

  const typeDisplayName = capitalize(type);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          {typeDisplayName}s
        </h1>
        <p className="text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Items Grid */}
      <ItemsGrid
        items={items}
        emptyMessage={`No ${typeDisplayName.toLowerCase()}s found. Create your first one!`}
      />
    </div>
  );
}
