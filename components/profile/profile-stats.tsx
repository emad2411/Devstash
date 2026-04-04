"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Folder, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemTypeBreakdown {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

interface ProfileStatsProps {
  totalItems: number;
  totalCollections: number;
  itemTypeBreakdown: ItemTypeBreakdown[];
}

export function ProfileStats({
  totalItems,
  totalCollections,
  itemTypeBreakdown,
}: ProfileStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="border-border/50 bg-card">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <FileCode className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalItems}</p>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
            <Folder className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {totalCollections}
            </p>
            <p className="text-sm text-muted-foreground">Collections</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card sm:col-span-2 lg:col-span-1">
        <CardContent className="p-6">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Items by Type
          </p>
          <div className="flex flex-wrap gap-2">
            {itemTypeBreakdown.map((type) => (
              <div
                key={type.id}
                className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-sm font-medium text-foreground">
                  {type.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {type.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}