"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, cn } from "@/lib/utils";

interface ProfileHeaderProps {
  name: string | null;
  email: string | null;
  image: string | null;
  isPro: boolean;
  createdAt: Date;
}

export function ProfileHeader({
  name,
  email,
  image,
  isPro,
  createdAt,
}: ProfileHeaderProps) {
  const formattedJoinDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(createdAt));

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <Avatar className="h-20 w-20">
        {image ? (
          <AvatarImage src={image} alt={name ?? email ?? "User avatar"} />
        ) : (
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-medium">
            {getInitials(name)}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground">
            {name ?? "Developer"}
          </h1>
          {isPro && (
            <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
              Pro
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{email}</p>
        <p className="text-xs text-muted-foreground">
          Joined {formattedJoinDate}
        </p>
      </div>
    </div>
  );
}