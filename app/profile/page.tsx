import { connection } from "next/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth-utils";
import { getProfileData, getProfileStats } from "@/lib/queries";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function ProfilePage() {
  await connection(); // Next.js 16: opt into dynamic rendering
  const user = await requireAuth();

  const [profileData, profileStats] = await Promise.all([
    getProfileData(user.id),
    getProfileStats(user.id),
  ]);

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-foreground">Profile</h1>

        {/* Profile Header */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-6">
            <ProfileHeader
              name={profileData.name}
              email={profileData.email}
              image={profileData.image}
              isPro={profileData.isPro}
              createdAt={profileData.createdAt}
            />
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Usage Stats</CardTitle>
            <CardDescription>
              Your DevStash activity at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileStats
              totalItems={profileStats.totalItems}
              totalCollections={profileStats.totalCollections}
              itemTypeBreakdown={profileStats.itemTypeBreakdown}
            />
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              {profileData.hasPasswordAccount
                ? "Update your password to keep your account secure"
                : "Password management not available for OAuth accounts"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm
              hasPasswordAccount={profileData.hasPasswordAccount}
            />
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountDialog userEmail={profileData.email} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}