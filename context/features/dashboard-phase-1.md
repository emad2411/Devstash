Create a responsive top navbar component  using Tailwind CSS v4 and shadcn/ui. 

The navbar should include:
- Left side: A collapsible sidebar toggle button (hamburger icon that transforms to close) and the "DevStash" logo with a code bracket icon (blue gradient icon)
- Center: A global search bar with placeholder "Search snippets, prompts, notes... (Press '/')" featuring a search icon, keyboard shortcut indicator (⌘K), and a subtle dark background with border
- Right side: Theme toggle (sun/moon icon), notification bell with badge indicator, "New Collection" button (dark/outline style), and "New Item" button (blue primary action)

Styling requirements:
- Background: bg-background/95 with backdrop-blur
- Border bottom: border-border/50
- Height: h-16
- Use shadcn Button, Input, and DropdownMenu components
- Add hover states and focus rings consistent with shadcn design system
- Include proper TypeScript types and make the sidebar toggle accept an onToggle callback prop