'use client';

import { mockStats } from '@/lib/data';

interface WelcomeHeaderProps {
  userName?: string;
}

export function WelcomeHeader({ userName = 'John' }: WelcomeHeaderProps) {
  const currentHour = new Date().getHours();

  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good afternoon';
  } else if (currentHour >= 17) {
    greeting = 'Good evening';
  }

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold tracking-tight">
        <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {greeting}, {userName}
        </span>
      </h1>
      <p className="mt-2 text-muted-foreground">
        You have {mockStats.totalItems} items stored in your stash.
      </p>
    </div>
  );
}
