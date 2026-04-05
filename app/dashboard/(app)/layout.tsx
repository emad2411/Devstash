import { connection } from "next/server";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getItemTypes, getCollections } from "@/lib/queries";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { SidebarCollection } from "@/types/layout";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const sessionUser = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPro: true,
    },
  });

  if (!user) {
    throw new Error('Authenticated user not found in database');
  }

  const [itemTypesRaw, collections] = await Promise.all([
    getItemTypes(user.id),
    getCollections(user.id),
  ]);

  // Sort itemTypes so "File" and "Image" appear at the end (Pro features)
  const itemTypes = [...itemTypesRaw].sort((a, b) => {
    const isAPro = a.name.toLowerCase() === 'file' || a.name.toLowerCase() === 'image';
    const isBPro = b.name.toLowerCase() === 'file' || b.name.toLowerCase() === 'image';
    if (isAPro && !isBPro) return 1;
    if (!isAPro && isBPro) return -1;
    return a.name.localeCompare(b.name);
  });

  // Transform collections for sidebar
  const sidebarCollections: SidebarCollection[] = collections.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.itemCount,
    color: c.mostCommonColor,
  }));

  return (
    <DashboardLayout
      collections={sidebarCollections}
      navItems={itemTypes}
      user={user}
    >
      {children}
    </DashboardLayout>
  );
}
