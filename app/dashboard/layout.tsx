import { requireAuth } from "@/lib/auth-utils";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side auth check - redirects to /login if not authenticated
  await requireAuth();

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {children}
    </div>
  );
}
