Create a collapsible sidebar component using Tailwind and shadcn/ui with two states: collapsed (icon-only) and expanded (full width).

Structure:
- TOP SECTION (always visible): Navigation items with icons - All Items (grid), Snippets (code brackets), Prompts (sparkles/AI icon), Commands (terminal), Notes (document), Images (image), Files (folder), Links (link icon). Each item should have an active state with subtle background highlight.

- MIDDLE SECTION: "COLLECTIONS" header with collapsible collection list showing folder icons + item counts (React Patterns: 12, Docker Configs: 5, API Prompts: 8, Useful Tools: 24, Design Assets: 15). Include a "Show All" expandable option.

- BOTTOM SECTION: User profile area with avatar (JD initials), name "John Doe", plan badge "Pro Plan" in blue, and settings gear icon.

Animation requirements:
- Smooth width transition between collapsed (~70px) and expanded (~260px) states
- Icon-only mode: centered icons with tooltip on hover
- Expanded mode: full labels, counts, and section headers visible
- Use Tailwind transition-all duration-300 ease-in-out
- Collapsed state should show a subtle vertical line indicator for active items

icon colors:
- use the same colors specified for rach category 

Props interface:
- isOpen: boolean
- onToggle: () => void
- activeItem: string
- onItemClick: (item: string) => void